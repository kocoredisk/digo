import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '@/styles/LandingAdminPage.css';

// 경기도 시군구 영문-한글 매핑
const gyeonggiNameMap = {
  'Ansan': '안산',
  'Ansoeng': '안성',
  'Anyang': '안양',
  'Bucheon': '부천',
  'Dongducheon': '동두천',
  'Gapyeong': '가평',
  'Gimpo': '김포',
  'Goyang': '고양',
  'Gunpo': '군포',
  'Guri': '구리',
  'Gwacheon': '과천',
  'Gwangju': '광주',
  'Gwangmyeong': '광명',
  'Hanam': '하남',
  'Hwaseong': '화성',
  'Icheon': '이천',
  'Namyangju': '남양주',
  'Osan': '오산',
  'Paju': '파주',
  'Pocheon': '포천',
  'Pyeongtaek': '평택',
  'Seongnam': '성남',
  'Siheung': '시흥',
  'Suwon': '수원',
  'Uijeongbu': '의정부',
  'Uiwang': '의왕',
  'Yangju': '양주',
  'Yangpyeong': '양평',
  'Yeoju': '여주',
  'Yeoncheon': '연천',
  'Yongin': '용인'
};

// 전국 도 영문-한글 매핑
const provinceNameMap = {
  'Seoul': '서울',
  'Busan': '부산',
  'Daegu': '대구',
  'Incheon': '인천',
  'Gwangju': '광주',
  'Daejeon': '대전',
  'Ulsan': '울산',
  'Gyeonggi-do': '경기도',
  'Gangwon-do': '강원도',
  'Chungcheongbuk-do': '충청북도',
  'Chungcheongnam-do': '충청남도',
  'Jeollabuk-do': '전라북도',
  'Jeollanam-do': '전라남도',
  'Gyeongsangbuk-do': '경상북도',
  'Gyeongsangnam-do': '경상남도',
  'Jeju': '제주도',
  'Jeju-do': '제주도'
};

// 서울 지도 컴포넌트
function SeoulMap({ geojson, markers = [] }) {
  const mapRef = useRef();
  const [svgBox, setSvgBox] = useState({ minX: 0, minY: 0, width: 719, height: 468 });
  useEffect(() => {
    if (!geojson || !mapRef.current) return;
    const svg = d3.select(mapRef.current);
    svg.selectAll("*").remove();
    
    // 원본 크기로 projection 계산
    const originalWidth = 719;
    const originalHeight = 468;
    const scale = 0.9; // 10% 줄임 (가로세로 비율 유지)
    const newWidth = originalWidth * scale; // 647.1
    const newHeight = originalHeight * scale; // 421.2
    
    const projection = d3.geoMercator().fitSize([originalWidth, originalHeight], geojson);
    const path = d3.geoPath().projection(projection);
    
    // path bounds로 SVG 크기 결정
    const bounds = path.bounds(geojson);
    const minX = bounds[0][0];
    const minY = bounds[0][1];
    const w = bounds[1][0] - bounds[0][0];
    const h = bounds[1][1] - bounds[0][1];
    
    // SVG 컨테이너는 원본 크기 유지, 내부 지도만 비율 유지하며 scale
    const containerWidth = originalWidth;
    const containerHeight = originalHeight;
    const xOffset = (containerWidth - newWidth) / 2; // 중앙 정렬을 위한 offset
    const yOffset = (containerHeight - newHeight) / 2; // 중앙 정렬을 위한 offset
    
    setSvgBox({ minX, minY, width: w, height: containerHeight });
    svg.attr('width', w).attr('height', containerHeight).attr('viewBox', `${minX} ${minY} ${w} ${containerHeight}`).style('background', 'transparent');
    
    const g = svg.append('g').attr('transform', `translate(${xOffset}, ${yOffset}) scale(${scale}, ${scale})`);
    
    // 지도 그리기
    g.selectAll('path.district')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('class', 'district')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
    
    // 텍스트 라벨
    g.selectAll('text')
      .data(geojson.features)
      .enter()
      .append('text')
      .attr('transform', d => {
        let [x, y] = path.centroid(d);
        // 라벨 보정: 양천, 종로, 성북, 강북
        const name = (d.properties.name || '').replace('구', '');
        if (name === '양천') y += 10;
        if (name === '종로') y += 10;
        if (name === '성북') y += 8;
        if (name === '강북') y += 8;
        return `translate(${x},${y})`;
      })
      .text(d => {
        let name = d.properties.name || '';
        if (name === '로구') return '구로';
        if (name === '중') return '중구';
        return name.replace('구', '구');
      })
      .attr('font-size', 10)
      .attr('fill', '#535353')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-weight', 500);
    
    // 마커 추가
    if (markers.length > 0) {
      g.selectAll('g.marker-group')
        .data(markers)
        .enter()
        .append('g')
        .attr('class', 'marker-group')
        .attr('transform', d => `translate(${projection([d.lng, d.lat])[0]}, ${projection([d.lng, d.lat])[1]})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this).select('circle').attr('r', 8).attr('fill', '#dc2626');
        })
        .on('mouseout', function(event, d) {
          d3.select(this).select('circle').attr('r', 6).attr('fill', d.color || '#ef4444');
        });
      
      // 구글 맵스 스타일 마커 (동적 색깔)
      g.selectAll('g.marker-group')
        .append('circle')
        .attr('r', 6)
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 2);
      
      // 핀 끝부분 (삼각형)
      g.selectAll('g.marker-group')
        .append('path')
        .attr('d', 'M-4,6 L4,6 L0,12 Z')
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 1);
      
      // 마커 라벨 (흰색 배경의 박스)
      g.selectAll('g.marker-group')
        .append('rect')
        .attr('x', -20)
        .attr('y', -25)
        .attr('width', 40)
        .attr('height', 16)
        .attr('fill', 'white')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('rx', 2);
      
      g.selectAll('g.marker-group')
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', 0)
        .attr('y', -15)
        .text(d => d.company)
        .attr('font-size', 9)
        .attr('fill', '#374151')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 600);
    }
  }, [geojson, markers]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: svgBox.width, height: svgBox.height }}>
      <svg ref={mapRef} style={{ display: 'block', width: svgBox.width, height: svgBox.height }} />
    </div>
  );
}

// 경기도 지도 컴포넌트
function GyeonggiMap({ geojson, markers = [] }) {
  const svgRef = useRef();
  const [svgBox, setSvgBox] = useState({ minX: 0, minY: 0, width: 358, height: 468 });
  useEffect(() => {
    if (!geojson || !svgRef.current) return;
    
    // 원본 크기로 projection 계산
    const originalWidth = 358;
    const originalHeight = 468;
    const scale = 0.9; // 10% 줄임 (가로세로 비율 유지)
    const newWidth = originalWidth * scale; // 322.2
    const newHeight = originalHeight * scale; // 421.2
    
    const projection = d3.geoMercator().fitSize([originalWidth, originalHeight], geojson);
    const path = d3.geoPath().projection(projection);
    
    // path bounds로 SVG 크기 결정
    const bounds = path.bounds(geojson);
    const minX = bounds[0][0];
    const minY = bounds[0][1];
    const w = bounds[1][0] - bounds[0][0];
    const h = bounds[1][1] - bounds[0][1];
    
    // SVG 컨테이너는 원본 크기 유지, 내부 지도만 비율 유지하며 scale
    const containerWidth = originalWidth;
    const containerHeight = originalHeight;
    const xOffset = (containerWidth - newWidth) / 2; // 중앙 정렬을 위한 offset
    const yOffset = (containerHeight - newHeight) / 2; // 중앙 정렬을 위한 offset
    
    setSvgBox({ minX, minY, width: w, height: containerHeight });
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr('width', w).attr('height', containerHeight).attr('viewBox', `${minX} ${minY} ${w} ${containerHeight}`).style('background', 'transparent');
    
    const g = svg.append('g').attr('transform', `translate(${xOffset}, ${yOffset}) scale(${scale}, ${scale})`);
    
    // 지도 그리기
    g.selectAll('path.district')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('class', 'district')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
    
    // 텍스트 라벨
    g.selectAll('text')
      .data(geojson.features)
      .enter()
      .append('text')
      .attr('transform', d => {
        let [x, y] = path.centroid(d);
        y += 6;
        return `translate(${x},${y})`;
      })
      .text(d => {
        const engName = d.properties.NAME_2 || d.properties.name || '';
        return gyeonggiNameMap[engName] || engName;
      })
      .attr('font-size', 10)
      .attr('fill', '#535353')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-weight', 500);
    
    // 마커 추가
    if (markers.length > 0) {
      g.selectAll('g.marker-group')
        .data(markers)
        .enter()
        .append('g')
        .attr('class', 'marker-group')
        .attr('transform', d => `translate(${projection([d.lng, d.lat])[0]}, ${projection([d.lng, d.lat])[1]})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this).select('circle').attr('r', 8).attr('fill', '#dc2626');
        })
        .on('mouseout', function(event, d) {
          d3.select(this).select('circle').attr('r', 6).attr('fill', d.color || '#ef4444');
        });
      
      // 구글 맵스 스타일 마커 (빨간색 핀)
      g.selectAll('g.marker-group')
        .append('circle')
        .attr('r', 6)
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 2);
      
      // 핀 끝부분 (삼각형)
      g.selectAll('g.marker-group')
        .append('path')
        .attr('d', 'M-4,6 L4,6 L0,12 Z')
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 1);
      
      // 마커 라벨 (흰색 배경의 박스)
      g.selectAll('g.marker-group')
        .append('rect')
        .attr('x', -20)
        .attr('y', -25)
        .attr('width', 40)
        .attr('height', 16)
        .attr('fill', 'white')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('rx', 2);
      
      g.selectAll('g.marker-group')
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', 0)
        .attr('y', -15)
        .text(d => d.company)
        .attr('font-size', 9)
        .attr('fill', '#374151')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 600);
    }
  }, [geojson, markers]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: svgBox.width, height: svgBox.height }}>
      <svg ref={svgRef} style={{ display: 'block', width: svgBox.width, height: svgBox.height }} width={svgBox.width} height={svgBox.height} viewBox={`${svgBox.minX} ${svgBox.minY} ${svgBox.width} ${svgBox.height}`} />
    </div>
  );
}

// 전국 지도 컴포넌트
function KoreaMap({ height = 468, markers = [] }) {
  const mapRef = useRef();
  const [koreaData, setKoreaData] = useState(null);
  const [svgBox, setSvgBox] = useState({ minX: 0, minY: 0, width: 400, height: height });
  useEffect(() => {
    fetch('/maps/skorea-provinces-geo.json')
      .then(res => res.json())
      .then(json => {
        // 울릉도/독도(경상북도, 동경 130도 이상, 북위 37도 이상) 제외 + 본토만 남김
        const filtered = json.features.map(feature => {
          if (feature.properties.NAME_1 === 'Gyeongsangbuk-do') {
            if (feature.geometry.type === 'MultiPolygon') {
              const newCoords = feature.geometry.coordinates.map(polygon =>
                polygon.filter(ring =>
                  !ring.some(coord => coord[0] >= 130 && coord[1] >= 37)
                )
              ).filter(polygon => polygon.length > 0);
              return { ...feature, geometry: { ...feature.geometry, coordinates: newCoords } };
            } else if (feature.geometry.type === 'Polygon') {
              const newCoords = feature.geometry.coordinates.filter(ring =>
                !ring.some(coord => coord[0] >= 130 && coord[1] >= 37)
              );
              return { ...feature, geometry: { ...feature.geometry, coordinates: newCoords } };
            }
          }
          if (feature.geometry.type === 'MultiPolygon') {
            const polygons = feature.geometry.coordinates;
            const areas = polygons.map(rings => d3.geoArea({ type: 'Feature', geometry: { type: 'Polygon', coordinates: rings } }));
            const maxAreaIdx = areas.indexOf(Math.max(...areas));
            const mainPolygon = polygons[maxAreaIdx];
            return { ...feature, geometry: { ...feature.geometry, coordinates: [mainPolygon] } };
          }
          return feature;
        });
        setKoreaData({ ...json, features: filtered });
      });
  }, []);
  useEffect(() => {
    if (!koreaData || !mapRef.current) return;
    
    // 원본 크기로 projection 계산
    const originalHeight = height;
    const scale = 0.9; // 10% 줄임 (가로세로 비율 유지)
    const newHeight = originalHeight * scale;
    
    const projection = d3.geoMercator().fitSize([400, originalHeight], koreaData);
    const path = d3.geoPath().projection(projection);
    const bounds = path.bounds(koreaData);
    const minX = bounds[0][0];
    const minY = bounds[0][1];
    const w = bounds[1][0] - bounds[0][0];
    const h = bounds[1][1] - bounds[0][1];
    const originalWidth = Math.round(originalHeight * (w / h));
    const newWidth = originalWidth * scale;
    
    // SVG 컨테이너는 원본 크기 유지, 내부 지도만 비율 유지하며 scale
    const containerWidth = originalWidth;
    const containerHeight = originalHeight;
    const xOffset = (containerWidth - newWidth) / 2; // 중앙 정렬을 위한 offset
    const yOffset = (containerHeight - newHeight) / 2; // 중앙 정렬을 위한 offset
    
    setSvgBox({ minX, minY, width: originalWidth, height: containerHeight });
    const svg = d3.select(mapRef.current);
    svg.selectAll("*").remove();
    svg.attr('width', originalWidth).attr('height', containerHeight).attr('viewBox', `${minX} ${minY} ${w} ${containerHeight}`).style('background', 'transparent');
    
    const g = svg.append('g').attr('transform', `translate(${xOffset}, ${yOffset}) scale(${scale}, ${scale})`);
    
    // 지도 그리기
    g.selectAll('path')
      .data(koreaData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
    
    // 텍스트 라벨
    g.selectAll('text')
      .data(koreaData.features)
      .enter()
      .append('text')
      .attr('transform', d => {
        let [x, y] = path.centroid(d);
        y += 6;
        return `translate(${x},${y})`;
      })
      .text(d => {
        const engName = d.properties.NAME_1 || d.properties.name || '';
        return provinceNameMap[engName] || engName;
      })
      .attr('font-size', d => {
        const engName = d.properties.NAME_1 || d.properties.name || '';
        const koreanName = provinceNameMap[engName] || engName;
        // 특정 도시들은 더 작은 폰트
        if (['서울', '인천', '대전', '광주', '대구', '울산'].includes(koreanName)) {
          return 8;
        }
        return 10;
      })
      .attr('fill', '#535353')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-weight', 500);
    
    // 마커 추가
    if (markers.length > 0) {
      g.selectAll('g.marker-group')
        .data(markers)
        .enter()
        .append('g')
        .attr('class', 'marker-group')
        .attr('transform', d => `translate(${projection([d.lng, d.lat])[0]}, ${projection([d.lng, d.lat])[1]})`)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this).select('circle').attr('r', 8).attr('fill', '#dc2626');
        })
        .on('mouseout', function(event, d) {
          d3.select(this).select('circle').attr('r', 6).attr('fill', d.color || '#ef4444');
        });
      
      // 구글 맵스 스타일 마커 (빨간색 핀)
      g.selectAll('g.marker-group')
        .append('circle')
        .attr('r', 6)
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 2);
      
      // 핀 끝부분 (삼각형)
      g.selectAll('g.marker-group')
        .append('path')
        .attr('d', 'M-4,6 L4,6 L0,12 Z')
        .attr('fill', d => d.color || '#ef4444')
        .attr('stroke', d => d.color || '#dc2626')
        .attr('stroke-width', 1);
      
      // 마커 라벨 (흰색 배경의 박스)
      g.selectAll('g.marker-group')
        .append('rect')
        .attr('x', -20)
        .attr('y', -25)
        .attr('width', 40)
        .attr('height', 16)
        .attr('fill', 'white')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('rx', 2);
      
      g.selectAll('g.marker-group')
        .append('text')
        .attr('class', 'marker-label')
        .attr('x', 0)
        .attr('y', -15)
        .text(d => d.company)
        .attr('font-size', 9)
        .attr('fill', '#374151')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 600);
    }
  }, [koreaData, height, markers]);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: svgBox.width, height: svgBox.height }}>
      <svg ref={mapRef} style={{ display: 'block', width: svgBox.width, height: svgBox.height }} width={svgBox.width} height={svgBox.height} viewBox={`${svgBox.minX} ${svgBox.minY} ${svgBox.width} ${svgBox.height}`} />
    </div>
  );
}

function MainPage() {
  // 지도 데이터 로드
  const [seoulData, setSeoulData] = useState(null);
  const [gyeonggiData, setGyeonggiData] = useState(null);
  const [koreaData, setKoreaData] = useState(null);

  // 상담 신청 더미 데이터
  const recentApplications = [
    { id: 1, name: '홍길동', service: '탄탄경리', date: '2024-06-10', status: '신규' },
    { id: 2, name: '김영희', service: '캐시맵', date: '2024-06-09', status: '처리중' },
    { id: 3, name: '이철수', service: '링키', date: '2024-06-09', status: '완료' },
    { id: 4, name: '박민수', service: '탄탄경리', date: '2024-06-08', status: '신규' },
    { id: 5, name: '최지우', service: '캐시맵', date: '2024-06-08', status: '완료' },
  ];

  // drawBoundingBox 함수 정의 (지도 컴포넌트보다 위에 위치)
  function drawBoundingBox(svg, features, projection, path) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    features.forEach(f => {
      const p = path(f);
      if (!p) return;
      const temp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      temp.setAttribute('d', p);
      svg.node().appendChild(temp);
      const bbox = temp.getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
      svg.node().removeChild(temp);
    });
    svg.append('rect')
      .attr('x', minX)
      .attr('y', minY)
      .attr('width', maxX - minX)
      .attr('height', maxY - minY)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2)
      .attr('pointer-events', 'none');
  }

  useEffect(() => {
    const loadMapData = async () => {
      console.log('loadMapData 시작');
      try {
        // 서울시 구 경계, 경기도 GeoJSON, 전국 GeoJSON 로드
        console.log('파일 fetch 시작');
        const [seoulResponse, gyeonggiResponse, koreaResponse] = await Promise.all([
          fetch('/maps/seoul_municipalities_geo.json'),
          fetch('/maps/skorea-municipalities-geo.json'),
          fetch('/maps/skorea-provinces-geo.json')
        ]);
        
        console.log('seoulResponse status:', seoulResponse.status);
        console.log('gyeonggiResponse status:', gyeonggiResponse.status);
        console.log('koreaResponse status:', koreaResponse.status);
        
        const seoulGeoJSON = await seoulResponse.json();
        const gyeonggiRaw = await gyeonggiResponse.json();
        const koreaGeoJSON = await koreaResponse.json();
        
        console.log('seoulGeoJSON:', seoulGeoJSON);
        console.log('seoulGeoJSON features 개수:', seoulGeoJSON.features?.length);
        console.log('gyeonggiRaw:', gyeonggiRaw);
        console.log('gyeonggiRaw features 개수:', gyeonggiRaw.features?.length);
        console.log('koreaGeoJSON:', koreaGeoJSON);
        
        // 경기도 시군구만 필터링 (MapPage와 동일)
        const gyeonggiFeatures = gyeonggiRaw.features.filter(feature => 
          feature.properties.NAME_1 === "Gyeonggi-do"
        );
        console.log('[경기도 features 개수]', gyeonggiFeatures.length);
        
        // 작은 feature(섬, 점 등) 제외 (MapPage와 동일)
        const minArea = 0.0000005;
        const filteredFeatures = [];
        gyeonggiFeatures.forEach((feature, idx) => {
          const area = d3.geoArea(feature);
          if (area > minArea) {
            filteredFeatures.push(feature);
          } else {
            const featureName = feature.properties.adm_nm || feature.properties.NAME_2 || `Feature ${idx}`;
            console.log(`[경기도 제외됨] ${featureName} (면적: ${area})`);
          }
        });
        console.log('[경기도 setGyeonggiData]', filteredFeatures.length, filteredFeatures.map(f => f.properties.adm_nm || f.properties.NAME_2));
        
        // 울릉도/독도 제외 필터링
        const filteredKoreaFeatures = koreaGeoJSON.features.map(feature => {
          // 경상북도인 경울릉도/독도 영역 제외
          if (feature.properties.NAME_1 === "Gyeongsangbuk-do") {
            // 울릉도/독도 영역을 제외한 새로운 geometry 생성
            const filteredCoordinates = feature.geometry.coordinates.map(polygon => 
              polygon.filter(ring => {
                // 각 좌표가 울릉도/독도 영역(동경 130도 이상, 북위 37도 이상)에 있는지 확인
                return !ring.some(coord => coord[0] >= 130 && coord[1] >= 37);
              })
            ).filter(polygon => polygon.length > 0); // 빈 폴리곤 제거
            
            return {
              ...feature,
              geometry: {
                ...feature.geometry,
                coordinates: filteredCoordinates
              }
            };
          }
          return feature;
        });
        
        setSeoulData(seoulGeoJSON);
        setGyeonggiData({ ...gyeonggiRaw, features: filteredFeatures });
        setKoreaData({ ...koreaGeoJSON, features: filteredKoreaFeatures });
        console.log('데이터 설정 완료');
      } catch (e) {
        console.error('loadMapData 에러:', e);
        // 에러 시 데이터 null 유지
      }
    };
    loadMapData();
  }, []);

  // 지도 실제 width/height 계산용 state
  const [seoulMapBox, setSeoulMapBox] = useState({ width: 558, height: 468 });
  const seoulMapRef = useRef();

  // 서울 지도 실제 bounding box 측정
  useEffect(() => {
    if (!seoulData || !seoulMapRef.current) return;
    const projection = d3.geoMercator().fitExtent([[0, 0], [1000, 1000]], seoulData);
    const path = d3.geoPath().projection(projection);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    seoulData?.features?.forEach(f => {
      const p = path(f);
      if (!p) return;
      const temp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      temp.setAttribute('d', p);
      seoulMapRef.current.appendChild(temp);
      const bbox = temp.getBBox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
      seoulMapRef.current.removeChild(temp);
    });
    const realWidth = Math.round(maxX - minX);
    const realHeight = Math.round(maxY - minY);
    setSeoulMapBox({ width: realWidth, height: realHeight });
    // 콘솔 출력
    console.log('서울 지도 bounding box:', realWidth, realHeight);
  }, [seoulData]);

  // 여백 없는 SVG 지도 컴포넌트 (서울/경기/전국 공통)
  function MapNoMargin({ geojson, width, height, refCallback }) {
    const svgRef = useRef();
    useEffect(() => {
      if (!geojson || !svgRef.current) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      // 1. path의 bounding box 계산
      const pathGen = d3.geoPath().projection(null);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      geojson.features.forEach(f => {
        const bounds = d3.geoPath().bounds(f);
        minX = Math.min(minX, bounds[0][0]);
        minY = Math.min(minY, bounds[0][1]);
        maxX = Math.max(maxX, bounds[1][0]);
        maxY = Math.max(maxY, bounds[1][1]);
      });
      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;
      // 2. projection을 bounding box에 fit
      const projection = d3.geoMercator().fitExtent([[0, 0], [boxWidth, boxHeight]], geojson);
      const path = d3.geoPath().projection(projection);
      // 3. SVG width/height를 bounding box와 정확히 일치
      svg.attr('width', boxWidth).attr('height', boxHeight).style('background', '#fff');
      svg.selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#fff')
        .attr('stroke', '#222')
        .attr('stroke-width', 1);
      // 파란색 bounding box
      svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('fill', 'none')
        .attr('stroke', '#2563eb')
        .attr('stroke-width', 2);
      if (refCallback) refCallback(svgRef.current, { width: boxWidth, height: boxHeight });
    }, [geojson]);
    return <svg ref={svgRef} style={{ display: 'block' }} />;
  }

  // A/B 영역 width 계산 (지도들의 실제 크기 사용)
  const seoulWidth = 570; // 서울 지도 실제 width
  const gyeonggiWidth = 358; // 경기도 지도 실제 width  
  const koreaWidth = 243; // 전국 지도 실제 width
  const mapGap = 20; // 지도 간 간격
  const sideMargin = 20; // 양쪽 여백
  const aWidth = sideMargin + seoulWidth + mapGap + gyeonggiWidth + mapGap + koreaWidth + sideMargin; // 1,251px
  const bWidth = 1850 - (aWidth + 16);
  const mapHeight = 468; // 모든 지도 높이

  // 날짜 버튼 샘플
  const dateTabs = [
    { label: '오늘', value: 'today' },
    { label: '전체', value: 'all' },
    { label: '내일', value: 'tomorrow' },
    { label: '모레', value: 'dayafter' },
    { label: '이후', value: 'after7' },
  ];
  const [selectedTab, setSelectedTab] = useState('today');

  // 일정 샘플 데이터 (시간순 정렬)
  const scheduleList = [
    { id: 1, company: '삼성전자', region: '서울 강남', time: '09:00', date: '2024-07-01', lat: 37.5665, lng: 126.9780 },
    { id: 2, company: 'LG화학', region: '서울 서초', time: '11:30', date: '2024-07-01', lat: 37.5013, lng: 127.0396 },
    { id: 3, company: '현대자동차', region: '경기 용인', time: '14:00', date: '2024-07-01', lat: 37.2411, lng: 127.1776 },
    { id: 4, company: 'SK하이닉스', region: '경기 성남', time: '16:30', date: '2024-07-01', lat: 37.4449, lng: 127.1389 },
    { id: 5, company: '포스코홀딩스', region: '서울 종로', time: '18:00', date: '2024-07-01', lat: 37.5735, lng: 126.9789 },
    { id: 6, company: '포스코', region: '서울 종로', time: '10:00', date: '2024-07-02', lat: 37.5735, lng: 126.9789 },
    { id: 7, company: 'KT', region: '서울 마포', time: '13:00', date: '2024-07-02', lat: 37.5665, lng: 126.9780 },
    { id: 8, company: '네이버', region: '서울 강남', time: '15:30', date: '2024-07-02', lat: 37.5665, lng: 126.9780 },
    { id: 9, company: '카카오', region: '서울 강남', time: '17:00', date: '2024-07-02', lat: 37.5665, lng: 126.9780 },
    { id: 10, company: '쿠팡', region: '경기 성남', time: '19:00', date: '2024-07-02', lat: 37.4449, lng: 127.1389 },
    { id: 11, company: '카카오', region: '서울 강남', time: '09:30', date: '2024-07-03', lat: 37.5665, lng: 126.9780 },
    { id: 12, company: '쿠팡', region: '경기 성남', time: '11:00', date: '2024-07-03', lat: 37.4449, lng: 127.1389 },
    { id: 13, company: '배달의민족', region: '서울 서초', time: '14:30', date: '2024-07-03', lat: 37.5013, lng: 127.0396 },
    { id: 14, company: '토스', region: '서울 강남', time: '16:00', date: '2024-07-03', lat: 37.5665, lng: 126.9780 },
    { id: 15, company: '당근마켓', region: '서울 마포', time: '18:30', date: '2024-07-03', lat: 37.5665, lng: 126.9780 },
    { id: 16, company: '토스', region: '서울 강남', time: '10:30', date: '2024-07-04', lat: 37.5665, lng: 126.9780 },
    { id: 17, company: '당근마켓', region: '서울 마포', time: '13:30', date: '2024-07-04', lat: 37.5665, lng: 126.9780 },
    { id: 18, company: '스타트업A', region: '경기 일산', time: '15:00', date: '2024-07-04', lat: 37.6584, lng: 126.7698 },
    { id: 19, company: '스타트업B', region: '서울 성수', time: '16:00', date: '2024-07-04', lat: 37.5447, lng: 127.0558 },
    { id: 20, company: '스타트업C', region: '서울 강남', time: '17:30', date: '2024-07-04', lat: 37.5665, lng: 126.9780 },
    { id: 21, company: '스타트업C', region: '서울 강남', time: '11:00', date: '2024-07-05', lat: 37.5665, lng: 126.9780 },
    { id: 22, company: '스타트업D', region: '경기 용인', time: '14:00', date: '2024-07-05', lat: 37.2411, lng: 127.1776 },
    { id: 23, company: '스타트업E', region: '서울 서초', time: '15:30', date: '2024-07-05', lat: 37.5013, lng: 127.0396 },
    { id: 24, company: '스타트업F', region: '경기 성남', time: '16:30', date: '2024-07-05', lat: 37.4449, lng: 127.1389 },
    { id: 25, company: '부산항만공사', region: '부산 해운대', time: '10:00', date: '2024-07-08', lat: 35.1796, lng: 129.0756 },
    { id: 26, company: '대구도시개발', region: '대구 수성', time: '13:00', date: '2024-07-09', lat: 35.8714, lng: 128.6014 },
    { id: 27, company: '인천항만공사', region: '인천 중구', time: '15:30', date: '2024-07-10', lat: 37.4563, lng: 126.7052 },
    { id: 28, company: '광주정보문화산업진흥원', region: '광주 서구', time: '11:00', date: '2024-07-11', lat: 35.1595, lng: 126.8526 },
    { id: 29, company: '대전정보통신산업진흥원', region: '대전 유성', time: '14:00', date: '2024-07-12', lat: 36.3504, lng: 127.3845 },
    { id: 30, company: '울산항만공사', region: '울산 남구', time: '16:00', date: '2024-07-15', lat: 35.5384, lng: 129.3114 },
  ];

  // 날짜별로 그룹핑
  const groupedSchedule = scheduleList.reduce((acc, cur) => {
    if (!acc[cur.date]) acc[cur.date] = [];
    acc[cur.date].push(cur);
    return acc;
  }, {});

  // 동적 날짜 필터 생성 함수
  const getDateFilters = () => {
    const today = new Date();
    const filters = ['전체'];
    
    // 오늘부터 7일간 (오늘 포함)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      if (i === 0) {
        // 오늘
        filters.push(`오늘(${day}일)`);
      } else {
        // 나머지 6일
        filters.push(`${month}/${day}`);
      }
    }
    
    // 마지막 날 이후
    const lastDate = new Date(today);
    lastDate.setDate(today.getDate() + 6); // 7일째 날
    const lastMonth = lastDate.getMonth() + 1;
    const lastDay = lastDate.getDate();
    filters.push('이후');
    
    return filters;
  };

  const dateFilters = getDateFilters();

  // 동적 스케줄 카드 생성 함수
  const getDynamicDateCards = () => {
    const today = new Date();
    const cards = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 오늘부터 7일간
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // 일요일(0) 또는 토요일(6)
      
      cards.push({
        date: dateStr,
        displayDate: `${month}/${day}`,
        dayName: dayName,
        isToday: i === 0,
        isWeekend: isWeekend,
        isHalfSize: isWeekend
      });
    }
    
    // 7일 이후 고정 카드
    cards.push({
      date: 'after7',
              displayDate: '이후',
      dayName: '',
      isToday: false,
      isWeekend: false,
      isHalfSize: false,
      isLargeCard: true
    });
    
    return cards;
  };

  const dynamicDateCards = getDynamicDateCards();

  // 날짜별 마커 색깔 함수
  const getMarkerColor = (date) => {
    const today = new Date();
    const scheduleDate = new Date(date);
    const diffDays = Math.floor((scheduleDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '#ef4444'; // 오늘 - 빨간색
    if (diffDays === 1) return '#f97316'; // 내일 - 주황색
    if (diffDays === 2) return '#eab308'; // 모레 - 노란색
    if (diffDays >= 3 && diffDays <= 6) return '#3b82f6'; // 3-6일 후 - 파란색
    if (diffDays >= 7) return '#8b5cf6'; // 7일 이후 - 보라색
    return '#6b7280'; // 기본 - 회색
  };

  // 날짜별 마커 색깔로 필터링된 마커들
  const getMarkersByDate = (date) => {
    return scheduleList.filter(item => {
      const itemDate = new Date(item.date);
      const targetDate = new Date(date);
      return itemDate.toDateString() === targetDate.toDateString();
    }).map(item => ({
      ...item,
      color: getMarkerColor(item.date)
    }));
  };

  return (
    <>
      {/* 첫 번째 로우: 지역별 현황 + 신청 현황 */}
      <div className="main-page-first-row" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: 16,
        marginBottom: '16px'
      }}>
        {/* A 섹션: 지역별 현황 */}
        <div className="main-page-map-section" style={{
          width: 1251,
          height: 528,
          border: '2px solid #2563eb',
          borderRadius: 12,
          background: '#fff',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: 0
        }}>
          <div style={{ padding: '16px 16px 8px 16px', height: 60, boxSizing: 'border-box', position: 'relative' }}>
            <div style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 0
            }}>
              지역별 상담 진행 현황
            </div>
            <div style={{
              width: 56,
              height: 2,
              background: '#2563eb',
              margin: '4px auto 0 auto',
              borderRadius: 1
            }} />
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: '#6b7280',
              fontWeight: '500',
              display: 'flex',
              gap: '20px'
            }}>
              {dateFilters.map((filter, index) => (
                <span key={index}>{filter}</span>
              ))}
            </div>
          </div>
          <div className="main-page-maps-container" style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 0,
            height: 468
          }}>
            <div style={{ width: 10 }} />
            <div style={{ width: 570, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {seoulData && <SeoulMap geojson={seoulData} markers={[]} />}
            </div>
            <div style={{ width: 20 }} />
            <div style={{ width: 358, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {gyeonggiData && <GyeonggiMap geojson={gyeonggiData} markers={[]} />}
            </div>
            <div style={{ width: 20 }} />
            <div style={{ width: 243, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {koreaData && <KoreaMap height={468} markers={[]} />}
            </div>
            <div style={{ width: 30 }} />
          </div>
        </div>
        {/* B 섹션: 신청 현황 */}
        <div className="main-page-application-section" style={{
          width: 583,
          height: 528,
          border: '2px solid #2563eb',
          borderRadius: 12,
          background: '#fff',
          boxSizing: 'border-box',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}>
          <div style={{ padding: 16 }}>
            <div style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 0
            }}>
              상담 신청 현황
            </div>
            <div style={{
              width: 56,
              height: 2,
              background: '#2563eb',
              margin: '4px auto 0 auto',
              borderRadius: 1
            }} />
            
            {/* 기간 표시 */}
            <div style={{
              textAlign: 'right',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '500',
              marginBottom: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              2024년 6월 1일 ~ 오늘까지
            </div>
            
            {/* 신청 현황 통계 */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '24px',
              justifyContent: 'space-between'
            }}>
              <div style={{ 
                background: '#f0f9ff', 
                padding: '8px 12px', 
                borderRadius: '8px',
                border: '1px solid #0ea5e9',
                flex: 1,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#0369a1', marginBottom: '2px' }}>총 신청</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0c4a6e' }}>24</div>
              </div>
              <div style={{ 
                background: '#fef3c7', 
                padding: '8px 12px', 
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                flex: 1,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#92400e', marginBottom: '2px' }}>처리중</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#78350f' }}>8</div>
              </div>
              <div style={{ 
                background: '#dcfce7', 
                padding: '8px 12px', 
                borderRadius: '8px',
                border: '1px solid #22c55e',
                flex: 1,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#166534', marginBottom: '2px' }}>완료</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#14532d' }}>16</div>
              </div>
            </div>
            
            {/* 최근 신청 목록 */}
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1f2937', 
              marginBottom: '12px',
              textAlign: 'center',
              padding: '8px 0',
              borderBottom: '2px solid #e5e7eb'
            }}>
              최근 신청 목록
            </div>
            <div className="main-page-application-list" style={{ 
              maxHeight: '280px', 
              overflowY: 'auto',
              borderRadius: '8px',
              background: '#ffffff'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '12px'
              }}>
                <thead>
                  <tr style={{ 
                    background: '#f8fafc'
                  }}>
                    <th style={{ 
                      padding: '10px 8px', 
                      textAlign: 'left', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '11px'
                    }}>
                      서비스
                    </th>
                    <th style={{ 
                      padding: '10px 8px', 
                      textAlign: 'left', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '11px'
                    }}>
                      회사
                    </th>
                    <th style={{ 
                      padding: '10px 8px', 
                      textAlign: 'left', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '11px'
                    }}>
                      신청자
                    </th>
                    <th style={{ 
                      padding: '10px 8px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '11px'
                    }}>
                      신청일
                    </th>
                    <th style={{ 
                      padding: '10px 8px', 
                      textAlign: 'center', 
                      fontWeight: '600', 
                      color: '#374151',
                      fontSize: '11px'
                    }}>
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app, index) => (
                    <tr key={app.id} style={{
                      background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                      transition: 'background-color 0.2s'
                    }}>
                      <td style={{ 
                        padding: '10px 8px', 
                        fontWeight: '500', 
                        color: '#1f2937',
                        fontSize: '11px'
                      }}>
                        {app.service}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        fontWeight: '500', 
                        color: '#1f2937',
                        fontSize: '11px'
                      }}>
                        주호글로벌
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        fontWeight: '500', 
                        color: '#1f2937',
                        fontSize: '11px'
                      }}>
                        {app.name}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {app.date}
                      </td>
                      <td style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          fontWeight: '600',
                          background: app.status === '신규' ? '#dbeafe' : 
                                     app.status === '처리중' ? '#fef3c7' : '#dcfce7',
                          color: app.status === '신규' ? '#1e40af' : 
                                 app.status === '처리중' ? '#92400e' : '#166534'
                        }}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* 두 번째 로우: 일정 현황 */}
      <div className="main-page-schedule-section" style={{
        border: '2px solid #2563eb',
        borderRadius: 12,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16
      }}>
        {/* 세로 타이틀 */}
        <div style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
          padding: '8px 0',
          borderRight: '2px solid #2563eb',
          paddingRight: 12
        }}>
          상담 일정
        </div>
        
        {/* 스케줄 카드들 */}
        <div style={{ flex: 1 }}>
          <div className="main-page-schedule-cards-container" style={{ 
            display: 'flex', 
            gap: 12, 
            height: '200px',
            overflowX: 'auto',
            alignItems: 'flex-start'
          }}>
            {/* 날짜별 카드들을 순서대로 렌더링 */}
            {dynamicDateCards.slice(0, 7).map((card, index) => {
              const daySchedule = groupedSchedule[card.date] || [];
              
              // 주말인 경우 (토요일 또는 일요일)
              if (card.isWeekend) {
                // 토요일인 경우에만 주말 카드 렌더링 (일요일은 토요일 카드 안에 포함)
                if (card.dayName === '토') {
                  const sundayCard = dynamicDateCards.find(c => c.dayName === '일');
                  const sundaySchedule = groupedSchedule[sundayCard?.date] || [];
                  
                  return (
                    <div key={`weekend-${card.date}`} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      minWidth: '80px'
                    }}>
                      {/* 토요일 카드 */}
                      <div className="weekend-card" style={{
                        width: '80px',
                        height: '96px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '2px'
                        }}>
                          {card.displayDate}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          ({card.dayName})
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#ef4444',
                          fontWeight: '500',
                          marginTop: '4px'
                        }}>
                          {daySchedule.length}건
                        </span>
                      </div>
                      
                      {/* 일요일 카드 */}
                      <div className="weekend-card" style={{
                        width: '80px',
                        height: '96px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '2px'
                        }}>
                          {sundayCard?.displayDate}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          ({sundayCard?.dayName})
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#ef4444',
                          fontWeight: '500',
                          marginTop: '4px'
                        }}>
                          {sundaySchedule.length}건
                        </span>
                      </div>
                    </div>
                  );
                }
                // 일요일인 경우는 토요일에서 처리했으므로 건너뛰기
                return null;
              }
              
              // 평일인 경우 개별 카드로 렌더링
              return (
                <div key={card.date} className="schedule-card" style={{
                  flex: 1,
                  minWidth: '180px',
                  height: '200px',
                  background: card.isToday ? '#fff' : '#f8fafc',
                  border: card.isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: card.isToday ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {/* 카드 헤더 */}
                  <div className="card-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: card.isToday ? '#3b82f6' : '#374151'
                      }}>
                        {card.displayDate}
                      </span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: card.isToday ? '#3b82f6' : '#6b7280',
                        fontWeight: '500'
                      }}>
                        ({card.dayName})
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {daySchedule.length}건
                    </span>
                  </div>
                  
                  {/* 스케줄 목록 */}
                  <div className="schedule-list" style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    fontSize: '12px'
                  }}>
                    {daySchedule.length > 0 ? (
                      daySchedule.map((schedule, idx) => (
                        <div key={schedule.id} style={{
                          padding: '4px 0',
                          borderBottom: idx < daySchedule.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#374151',
                            marginBottom: '2px'
                          }}>
                            {schedule.company}
                          </div>
                          <div style={{ 
                            color: '#6b7280',
                            fontSize: '11px'
                          }}>
                            {schedule.time} • {schedule.region}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        color: '#9ca3af', 
                        textAlign: 'center',
                        padding: '20px 0',
                        fontSize: '11px'
                      }}>
                        일정 없음
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* 7일 이후 고정 카드 */}
            {dynamicDateCards.slice(7).map((card, index) => {
              // 7일 이후 데이터 필터링 수정 - 현재 날짜 기준으로 7일 이후
              const today = new Date();
              const after7Schedule = scheduleList.filter(item => {
                const itemDate = new Date(item.date);
                const diffDays = Math.floor((itemDate - today) / (1000 * 60 * 60 * 24));
                return diffDays >= 7;
              });
              
              return (
                <div key={card.date} className="after7-card" style={{
                  width: '280px',
                  height: '200px',
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {/* 카드 헤더 */}
                  <div className="card-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#0c4a6e'
                      }}>
                        {card.displayDate}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {after7Schedule.length}건
                    </span>
                  </div>
                  
                  {/* 스케줄 목록 */}
                  <div className="schedule-list" style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    fontSize: '12px'
                  }}>
                    {after7Schedule.length > 0 ? (
                      after7Schedule.map((schedule, idx) => (
                        <div key={schedule.id} style={{
                          padding: '4px 0',
                          borderBottom: idx < after7Schedule.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#374151',
                            marginBottom: '2px'
                          }}>
                            {schedule.company}
                          </div>
                          <div style={{ 
                            color: '#6b7280',
                            fontSize: '11px'
                          }}>
                            {schedule.time} • {schedule.region}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        color: '#9ca3af', 
                        textAlign: 'center',
                        padding: '20px 0',
                        fontSize: '11px'
                      }}>
                        일정 없음
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// 대시보드 데모 컴포넌트 (더미/샘플 데이터만)
const DashboardDemo = ({ seoulData, gyeonggiData, koreaData }) => {
  // 더미 데이터
  const todayCount = 3;
  const totalCount = 128;
  const salesCount = 7;
  const serviceCount = 4;
  const recentApplications = [
    { id: 1, name: '홍길동', service: '탄탄경리', date: '2024-06-10', status: '신규' },
    { id: 2, name: '김영희', service: '캐시맵', date: '2024-06-09', status: '처리중' },
    { id: 3, name: '이철수', service: '링키', date: '2024-06-09', status: '완료' },
    { id: 4, name: '박민수', service: '탄탄경리', date: '2024-06-08', status: '신규' },
    { id: 5, name: '최지우', service: '캐시맵', date: '2024-06-08', status: '완료' },
  ];

  return (
    <div style={{ padding: '16px', background: '#f4f6fa', minHeight: '100vh' }}>
      {/* 대시보드 상단: 지도 3개 + 상담 목록 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* 지도 3개 */}
        <div style={{ display: 'flex', gap: '16px', flex: 2 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', minWidth: 620, minHeight: 520 }}>
            <SeoulMap width={620} height={520} />
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', minWidth: 320, minHeight: 520 }}>
            <GyeonggiMap height={520} />
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', minWidth: 260, minHeight: 520 }}>
            <KoreaMap height={520} />
          </div>
        </div>
        {/* 상담 신청 목록 */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', minWidth: 260 }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>상담 신청 목록</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>이름</th>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>서비스</th>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>신청일</th>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#374151' }}>{app.name}</td>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#374151' }}>{app.service}</td>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#6b7280' }}>{app.date}</td>
                  <td style={{ padding: '8px', textAlign: 'left' }}>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: app.status === '신규' ? '#dbeafe' : app.status === '처리중' ? '#fef3c7' : '#dcfce7',
                      color: app.status === '신규' ? '#1e40af' : app.status === '처리중' ? '#92400e' : '#166534'
                    }}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 날짜별 상담 현황 (하단) */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', marginTop: '8px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '15px', fontWeight: '600', color: '#374151' }}>일자별 상담 현황</h3>
        <div style={{ display: 'flex', gap: '18px', fontSize: '14px', color: '#374151' }}>
          <div>오늘(23회)</div>
          <div>24일</div>
          <div>25일</div>
          <div>26일</div>
          <div>27일</div>
          <div>28일</div>
                          <div>이후</div>
        </div>
      </div>
    </div>
  );
};

// 랜딩페이지 > tan 폴더의 html/jsp 파일을 타이틀+링크로 표출하는 컴포넌트
function TanLandingLinks() {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    setFiles([
      { name: '탄탄 메인 랜딩', file: '/landings/tan/tantans_index.jsp' },
      { name: '탄탄 메인 랜딩(압축)', file: '/landings/tan/tantans_index.zip' },
    ]);
  }, []);
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>탄탄 랜딩페이지 파일 목록</h2>
      <ul>
        {files.map(f => (
          <li key={f.file} style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>{f.name}</span> :
            <a href={f.file} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', marginLeft: 8 }}>{f.file}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainPage; 