import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ClassRegistration } from '../entities/class-registration.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassRegistration)
    private readonly repo: Repository<ClassRegistration>,
    private readonly configService: ConfigService,
  ) {}

  async confirmPayment(body: {
    authToken: string;
    tid: string;
    amount: number;
    orderId: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
    courseName: string;
  }): Promise<ClassRegistration> {
    const clientId = this.configService.get<string>('NICEPAY_CLIENT_ID');
    const secretKey = this.configService.get<string>('NICEPAY_SECRET_KEY');

    // 1. 서명 검증
    const _expectedSig = crypto
      .createHash('sha256')
      .update(`${body.authToken}${clientId}${body.amount}${secretKey}`)
      .digest('hex');
    // (나이스페이먼츠가 returnUrl로 signature도 전달하는 경우 비교, 아닌 경우 생략 가능)

    // 2. tid 중복 방지
    const existing = await this.repo.findOne({ where: { tid: body.tid } });
    if (existing) {
      throw new ConflictException('이미 처리된 거래입니다.');
    }

    // 3. 나이스페이먼츠 승인 API 호출
    const credentials = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const nicepayRes = await fetch(`https://api.nicepay.co.kr/v1/payments/${body.tid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({ amount: body.amount }),
    });

    const nicepayData = await nicepayRes.json() as any;

    if (nicepayData.resultCode !== '0000') {
      throw new BadRequestException(`결제 승인 실패: ${nicepayData.resultMsg}`);
    }

    // 4. amount 교차검증
    if (Number(nicepayData.amount) !== Number(body.amount)) {
      throw new BadRequestException('결제 금액 불일치');
    }

    // 5. DB 저장
    const registration = this.repo.create({
      name: body.name,
      phone: body.phone,
      email: body.email,
      company: body.company ?? null,
      courseName: body.courseName,
      amount: body.amount,
      paymentStatus: 'paid',
      tid: body.tid,
      orderId: body.orderId,
      paidAt: new Date(),
    });

    return this.repo.save(registration);
  }

  // 나이스페이먼츠 returnUrl에서 호출 — 신청자 정보 없이 결제 정보만 저장
  async confirmRedirect(body: {
    authToken: string;
    tid: string;
    amount: number;
    orderId: string;
  }): Promise<ClassRegistration> {
    const clientId = this.configService.get<string>('NICEPAY_CLIENT_ID');
    const secretKey = this.configService.get<string>('NICEPAY_SECRET_KEY');

    const existing = await this.repo.findOne({ where: { tid: body.tid } });
    if (existing) return existing;

    const credentials = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const nicepayRes = await fetch(`https://api.nicepay.co.kr/v1/payments/${body.tid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({ amount: body.amount }),
    });

    const nicepayData = await nicepayRes.json() as any;

    if (nicepayData.resultCode !== '0000') {
      throw new BadRequestException(`승인 실패: ${nicepayData.resultMsg}`);
    }

    // orderId에서 반 정보 추출: AX_WED_xxx or AX_SAT_xxx
    const courseNameFromOrder = body.orderId.includes('_WED_')
      ? 'AX First Step - 평일심야반 (4/29~, 오후 7~10시)'
      : body.orderId.includes('_SAT_')
      ? 'AX First Step - 토요일오후반 (5/2~, 오후 1~6시)'
      : 'AX First Step';

    // 정원 초과 체크
    const count = await this.repo.count({ where: { courseName: courseNameFromOrder, paymentStatus: 'paid' } });
    if (count >= 10) {
      throw new BadRequestException('해당 반이 마감되었습니다.');
    }

    const registration = this.repo.create({
      name: '',
      phone: '',
      email: '',
      courseName: courseNameFromOrder,
      amount: body.amount,
      paymentStatus: 'paid',
      tid: body.tid,
      orderId: body.orderId,
      paidAt: new Date(),
    });

    const saved = await this.repo.save(registration);

    // 텔레그램 결제 알림
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (botToken && chatId) {
      const msg = `💳 <b>AX First Step 결제 완료</b>\n\n강좌: ${courseNameFromOrder}\n금액: ${Number(body.amount).toLocaleString('ko-KR')}원\n주문ID: ${body.orderId}\n시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
      }).catch(() => {});
    }

    return saved;
  }

  async getSeats(): Promise<{ courseName: string; registered: number; remaining: number }[]> {
    const CAPACITY = 10;
    const courses = [
      'AX First Step - 수요일반 (4/29~, 오후 7~10시)',
      'AX First Step - 토요일반 (5/2~, 오후 1~6시)',
    ];
    const result: { courseName: string; registered: number; remaining: number }[] = [];
    for (const courseName of courses) {
      const count = await this.repo.count({
        where: { courseName, paymentStatus: 'paid' },
      });
      result.push({ courseName, registered: count, remaining: Math.max(0, CAPACITY - count) });
    }
    return result;
  }

  async getRegistrations(): Promise<ClassRegistration[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async updateRegistration(id: number, dto: { paymentStatus?: string }): Promise<ClassRegistration> {
    const reg = await this.repo.findOne({ where: { id } });
    if (!reg) throw new BadRequestException('수강생을 찾을 수 없습니다.');
    if (dto.paymentStatus) reg.paymentStatus = dto.paymentStatus;
    return this.repo.save(reg);
  }
}
