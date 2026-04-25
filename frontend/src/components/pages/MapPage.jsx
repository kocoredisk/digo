import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

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

function MapFixedHeight({ geojson, label, width, height = 468, color = '#2563eb', autoWidth = false }) {
  const svgRef = useRef();
  const [calculatedWidth, setCalculatedWidth] = useState(width || 0);

  useEffect(() => {
    if (!geojson || !svgRef.current) return;
    let w = width;
    let bounds = d3.geoPath().bounds(geojson);
    if (autoWidth) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      geojson.features.forEach(feature => {
        const [[x0, y0], [x1, y1]] = d3.geoPath().bounds(feature);
        if (x0 < minX) minX = x0;
        if (x1 > maxX) maxX = x1;
        if (y0 < minY) minY = y0;
        if (y1 > maxY) maxY = y1;
      });
      const aspectRatio = (maxX - minX) / (maxY - minY);
      w = Math.round(height * aspectRatio);
      setCalculatedWidth(w);
      bounds = [[minX, minY], [maxX, maxY]];
    } else {
      setCalculatedWidth(width);
    }
    const merged = { type: 'FeatureCollection', features: geojson.features };
    const projection = d3.geoMercator().fitExtent([[0, 0], [w, height]], { ...merged, bbox: bounds });
    const path = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', w).attr('height', height).style('background', '#fff');
    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#222')
      .attr('stroke-width', 1);
    // 디버깅 로그
    console.log('[MapFixedHeight SVG]', label, 'w:', w, 'h:', height, 'features:', geojson.features.length, 'svgRef:', svgRef.current);
  }, [geojson, width, height, autoWidth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: width, minHeight: height, flexShrink: 0 }}>
      <svg ref={svgRef} style={{ display: 'block', minWidth: width, minHeight: height, flexShrink: 0 }} />
    </div>
  );
}

function SeoulMap({ geojson }) {
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
    g.selectAll('path.district')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('class', 'district')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
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
  }, [geojson]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: svgBox.width, minHeight: svgBox.height, marginBottom: 20 }}>
      <svg ref={mapRef} style={{ display: 'block', minWidth: svgBox.width, minHeight: svgBox.height }} />
    </div>
  );
}

function GyeonggiMap({ geojson }) {
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
    g.selectAll('path.district')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('class', 'district')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
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
  }, [geojson]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: svgBox.width, minHeight: svgBox.height, marginBottom: 20 }}>
      <svg ref={svgRef} style={{ display: 'block', minWidth: svgBox.width, minHeight: svgBox.height }} width={svgBox.width} height={svgBox.height} viewBox={`${svgBox.minX} ${svgBox.minY} ${svgBox.width} ${svgBox.height}`} />
    </div>
  );
}

function KoreaMap({ height = 468 }) {
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
    g.selectAll('path')
      .data(koreaData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5);
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
  }, [koreaData, height]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: svgBox.width, minHeight: svgBox.height, marginBottom: 20 }}>
      <svg ref={mapRef} style={{ display: 'block', minWidth: svgBox.width, minHeight: svgBox.height }} width={svgBox.width} height={svgBox.height} viewBox={`${svgBox.minX} ${svgBox.minY} ${svgBox.width} ${svgBox.height}`} />
    </div>
  );
}

export { SeoulMap, GyeonggiMap, KoreaMap };
export default function MapPage() {
  const [gyeonggiData, setGyeonggiData] = useState(null);
  const [seoulData, setSeoulData] = useState(null);

  useEffect(() => {
    // 경기도 시군구 데이터 사용 (더 정확한 경계)
    fetch('/maps/skorea-municipalities-geo.json').then(res => {
      console.log('[경기도 fetch status]', res.status);
      return res.json();
    }).then(raw => {
      // 경기도 시군구만 필터링
      const gyeonggiFeatures = raw.features.filter(feature => 
        feature.properties.NAME_1 === "Gyeonggi-do"
      );
      console.log('[경기도 features 개수]', gyeonggiFeatures.length);
      // 작은 feature(섬, 점 등) 제외
      const minArea = 0.0000005; // 임계값(매우 작게)
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
      setGyeonggiData({ ...raw, features: filteredFeatures });
    });
    
    fetch('/maps/seoul_municipalities_geo.json').then(res => res.json()).then(raw => {
      setSeoulData(raw);
    });
  }, []);

  return (
    <div style={{ width: '100%', minHeight: 600, background: 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'center', padding: 40 }}>
      {/* 좌측 세로 실선 */}
      <div style={{ width: 1, height: 480, background: '#e11d48', marginRight: 20 }} />
      {/* 서울 지도 */}
      {seoulData && <SeoulMap geojson={seoulData} />}
      {/* 20px 간격 */}
      <div style={{ width: 20 }} />
      {/* 경기도 지도: 358x468 픽스 */}
      {gyeonggiData && <GyeonggiMap geojson={gyeonggiData} />}
      {/* 20px 간격 */}
      <div style={{ width: 20 }} />
      {/* 전국 지도 */}
      <KoreaMap height={468} />
    </div>
  );
} 