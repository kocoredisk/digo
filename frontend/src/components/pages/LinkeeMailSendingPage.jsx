import React, { useState, useEffect } from 'react';

const LinkeeMailSendingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [totalTargets, setTotalTargets] = useState(0);
  const [completedCampaigns, setCompletedCampaigns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    campaign_round: '1차',
    extraction_date: '',
    target_count: '',
    notes: ''
  });

  // 전체 대상 수 조회
  useEffect(() => {
    fetchTotalTargets();
    fetchCampaigns();
    fetchHistory();
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    setNewCampaign(prev => ({ ...prev, extraction_date: today }));
  }, []);

  const fetchTotalTargets = async () => {
    try {
      // 전체 대상 수 조회
      const response = await fetch('/api/linkee-mails/overview');
      if (response.ok) {
        const data = await response.json();
        // 전체 대상 수와 완료된 홍보활동 수를 표시
        setTotalTargets(data.totalTargets);
        setCompletedCampaigns(data.completedCampaigns);
      }
    } catch (error) {
      console.error('전체 대상 수 조회 오류:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/linkee-mails/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('캠페인 목록 조회 오류:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/linkee-mails/history');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        }
      }
    } catch (error) {
      console.error('발송 히스토리 조회 오류:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({ ...prev, [name]: value }));
  };

  const generateExtractionNumber = (campaignRound = '1차') => {
    // 1차 캠페인에서 생성되는 추출 번호는 항상 1-1, 1-2, 1-3... 형태
    const existingNumbers = campaigns
      .filter(c => c.campaign_round === campaignRound && c.extraction_number && c.extraction_number !== '')
      .map(c => {
        const parts = c.extraction_number.split('-');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      })
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a);
    
    const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1;
    return `${campaignRound.split('차')[0]}-${nextNumber}`;
  };



  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    // 현재 활성 캠페인 찾기 (캠페인 자체만)
    const activeCampaign = campaigns.find(c => c.status === 'active' && c.extraction_number === null);
    if (!activeCampaign) {
      alert('활성 상태인 캠페인이 없습니다. 먼저 캠페인을 생성해주세요.');
      return;
    }
    
    if (!newCampaign.extraction_date || !newCampaign.target_count) {
      alert('날짜와 추출 수량을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/linkee-mails/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_round: activeCampaign.campaign_round,
          extraction_date: newCampaign.extraction_date,
          target_count: newCampaign.target_count,
          notes: newCampaign.notes
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`메일링 타겟이 생성되었습니다.\n잔여 대상: ${result.remainingCount}명\n큐 등록: ${result.addedCount}명`);
        // 폼 초기화 (날짜는 오늘 날짜로 유지)
        const today = new Date().toISOString().split('T')[0];
        setNewCampaign({
          campaign_round: activeCampaign.campaign_round,
          extraction_date: today,
          target_count: '',
          notes: ''
        });
        fetchCampaigns();
        fetchTotalTargets();
      } else {
        alert('메일링 타겟 생성 실패: ' + result.message);
      }
    } catch (error) {
      console.error('메일링 타겟 생성 오류:', error);
      alert('메일링 타겟 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractAndQueue = async (campaignId) => {
    if (!confirm('이 캠페인을 실행하여 대상을 추출하고 큐에 등록하시겠습니까?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/linkee-mails/extract-and-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        fetchCampaigns();
        fetchTotalTargets();
      } else {
        alert('추출 및 큐 등록 실패: ' + result.message);
      }
    } catch (error) {
      console.error('추출 및 큐 등록 오류:', error);
      alert('추출 및 큐 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingCount = (campaign) => {
    if (campaign.status === 'completed') {
      return campaign.remaining_count;
    }
    
    // pending 상태인 경우 이전 완료된 추출들의 합계를 빼서 계산
    const previousCompleted = campaigns
      .filter(c => c.campaign_round === campaign.campaign_round && c.status === 'completed')
      .reduce((sum, c) => sum + (c.actual_count || 0), 0);
    
    return totalTargets - previousCompleted;
  };

  // 캠페인별로 그룹화
  const groupedCampaigns = campaigns.reduce((groups, campaign) => {
    const round = campaign.campaign_round;
    if (!groups[round]) {
      groups[round] = [];
    }
    groups[round].push(campaign);
    return groups;
  }, {});

  // 각 캠페인별 총 발송 완료 수량
  const getCampaignTotalSent = (campaignRound) => {
    return campaigns
      .filter(c => c.campaign_round === campaignRound && c.status === 'completed')
      .reduce((sum, c) => sum + (c.actual_count || 0), 0);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">링키홍보 메일발송</h1>
          <div className="flex items-center space-x-6 ml-[100px]">
                      {/* 녹색 세트 - 1차 캠페인 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                if (loading) return;
                
                const today = new Date().toISOString().split('T')[0];
                
                setLoading(true);
                try {
                  const response = await fetch('/api/linkee-mails/create-campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      campaign_round: '1차',
                      extraction_date: today,
                      target_count: 500,
                      notes: '1차 캠페인 자동 생성'
                    })
                  });

                  const result = await response.json();
                  
                  if (result.success) {
                    alert(`1차 캠페인이 생성되었습니다.\n잔여 대상: ${result.remainingCount}명`);
                    fetchCampaigns();
                    fetchTotalTargets();
                  } else {
                    alert('1차 캠페인 생성 실패: ' + result.message);
                  }
                } catch (error) {
                  console.error('1차 캠페인 생성 오류:', error);
                  alert('1차 캠페인 생성 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || campaigns.find(c => c.campaign_round === '1차')}
              className={`px-4 py-1 rounded-md font-medium text-sm ${
                campaigns.find(c => c.campaign_round === '1차') 
                  ? 'bg-green-300 text-green-700 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              } ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? '처리 중...' : '1차 생성'}
            </button>
              
              <button
                onClick={async () => {
                  if (loading) return;
                  
                  const firstCampaign = campaigns.find(c => c.campaign_round === '1차');
                  if (!firstCampaign) {
                    alert('1차 캠페인이 생성되지 않았습니다.');
                    return;
                  }
                  
                  if (!window.confirm('1차 캠페인을 마감하시겠습니까?\n\n마감 후에는 1차 캠페인 관련 작업을 할 수 없습니다.')) {
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const response = await fetch('/api/linkee-mails/close-campaign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        campaign_round: '1차'
                      })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                      alert('1차 캠페인이 마감되었습니다.\n이제 2차 캠페인을 생성할 수 있습니다.');
                      fetchCampaigns();
                      fetchTotalTargets();
                    } else {
                      alert('1차 캠페인 마감 실패: ' + result.message);
                    }
                  } catch (error) {
                    console.error('1차 캠페인 마감 오류:', error);
                    alert('1차 캠페인 마감 중 오류가 발생했습니다.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !campaigns.find(c => c.campaign_round === '1차')}
                className={`px-4 py-1 rounded-md font-medium text-sm ${
                  campaigns.find(c => c.campaign_round === '1차') 
                    ? 'bg-green-700 text-white hover:bg-green-800' 
                    : 'bg-green-300 text-green-700 cursor-not-allowed'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? '처리 중...' : '1차 마감'}
              </button>
            </div>
            
                      {/* 파랑 세트 - 2차 캠페인 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                if (loading) return;
                
                // 1차 캠페인이 마감되었는지 확인
                const firstCampaign = campaigns.find(c => c.campaign_round === '1차');
                if (!firstCampaign || firstCampaign.status !== 'closed') {
                  alert('먼저 1차 캠페인을 마감해주세요.');
                  return;
                }
                
                const today = new Date().toISOString().split('T')[0];
                
                setLoading(true);
                try {
                  const response = await fetch('/api/linkee-mails/create-campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      campaign_round: '2차',
                      extraction_date: today,
                      target_count: 500,
                      notes: '2차 캠페인 자동 생성'
                    })
                  });

                  const result = await response.json();
                  
                  if (result.success) {
                    alert(`2차 캠페인이 생성되었습니다.\n잔여 대상: ${result.remainingCount}명`);
                    fetchCampaigns();
                    fetchTotalTargets();
                  } else {
                    alert('2차 캠페인 생성 실패: ' + result.message);
                  }
                } catch (error) {
                  console.error('2차 캠페인 생성 오류:', error);
                  alert('2차 캠페인 생성 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !campaigns.find(c => c.campaign_round === '1차' && c.status === 'closed')}
              className={`px-4 py-1 rounded-md font-medium text-sm ${
                campaigns.find(c => c.campaign_round === '1차' && c.status === 'closed') 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-300 text-blue-700 cursor-not-allowed'
              } ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? '처리 중...' : '2차 생성'}
            </button>
              
              <button
                onClick={async () => {
                  if (loading) return;
                  
                  const secondCampaign = campaigns.find(c => c.campaign_round === '2차');
                  if (!secondCampaign) {
                    alert('2차 캠페인이 생성되지 않았습니다.');
                    return;
                  }
                  
                  if (!window.confirm('2차 캠페인을 마감하시겠습니까?\n\n마감 후에는 2차 캠페인 관련 작업을 할 수 없습니다.')) {
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const response = await fetch('/api/linkee-mails/close-campaign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        campaign_round: '2차'
                      })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                      alert('2차 캠페인이 마감되었습니다.\n이제 3차 캠페인을 생성할 수 있습니다.');
                      fetchCampaigns();
                      fetchTotalTargets();
                    } else {
                      alert('2차 캠페인 마감 실패: ' + result.message);
                    }
                  } catch (error) {
                    console.error('2차 캠페인 마감 오류:', error);
                    alert('2차 캠페인 마감 중 오류가 발생했습니다.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !campaigns.find(c => c.campaign_round === '2차')}
                className={`px-4 py-1 rounded-md font-medium text-sm ${
                  campaigns.find(c => c.campaign_round === '2차') 
                    ? 'bg-blue-700 text-white hover:bg-blue-800' 
                    : 'bg-blue-300 text-blue-700 cursor-not-allowed'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? '처리 중...' : '2차 마감'}
              </button>
            </div>
            
                      {/* 보라 세트 - 3차 캠페인 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                if (loading) return;
                
                // 2차 캠페인이 마감되었는지 확인
                const secondCampaign = campaigns.find(c => c.campaign_round === '2차');
                if (!secondCampaign || secondCampaign.status !== 'closed') {
                  alert('먼저 2차 캠페인을 마감해주세요.');
                  return;
                }
                
                const today = new Date().toISOString().split('T')[0];
                
                setLoading(true);
                try {
                  const response = await fetch('/api/linkee-mails/create-campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      campaign_round: '3차',
                      extraction_date: today,
                      target_count: 500,
                      notes: '3차 캠페인 자동 생성'
                    })
                  });

                  const result = await response.json();
                  
                  if (result.success) {
                    alert(`3차 캠페인이 생성되었습니다.\n잔여 대상: ${result.remainingCount}명`);
                    fetchCampaigns();
                    fetchTotalTargets();
                  } else {
                    alert('3차 캠페인 생성 실패: ' + result.message);
                  }
                } catch (error) {
                  console.error('3차 캠페인 생성 오류:', error);
                  alert('3차 캠페인 생성 중 오류가 발생했습니다.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !campaigns.find(c => c.campaign_round === '2차' && c.status === 'closed')}
              className={`px-4 py-1 rounded-md font-medium text-sm ${
                campaigns.find(c => c.campaign_round === '2차' && c.status === 'closed') 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-purple-300 text-purple-700 cursor-not-allowed'
              } ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? '처리 중...' : '3차 생성'}
            </button>
              
              <button
                onClick={async () => {
                  if (loading) return;
                  
                  const thirdCampaign = campaigns.find(c => c.campaign_round === '3차');
                  if (!thirdCampaign) {
                    alert('3차 캠페인이 생성되지 않았습니다.');
                    return;
                  }
                  
                  if (!window.confirm('3차 캠페인을 마감하시겠습니까?\n\n마감 후에는 3차 캠페인 관련 작업을 할 수 없습니다.')) {
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const response = await fetch('/api/linkee-mails/close-campaign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        campaign_round: '3차'
                      })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                      alert('3차 캠페인이 마감되었습니다.\n모든 캠페인이 완료되었습니다.');
                      fetchCampaigns();
                      fetchTotalTargets();
                    } else {
                      alert('3차 캠페인 마감 실패: ' + result.message);
                    }
                  } catch (error) {
                    console.error('3차 캠페인 마감 오류:', error);
                    alert('3차 캠페인 마감 중 오류가 발생했습니다.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !campaigns.find(c => c.campaign_round === '3차')}
                className={`px-4 py-1 rounded-md font-medium text-sm ${
                  campaigns.find(c => c.campaign_round === '3차') 
                    ? 'bg-purple-700 text-white hover:bg-purple-800' 
                    : 'bg-purple-300 text-purple-700 cursor-not-allowed'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? '처리 중...' : '3차 마감'}
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={async () => {
            if (loading) return;
            
            if (!window.confirm('테스트용 메일 10개를 큐로 보내시겠습니까?\n\n수신자: wwwbomnal@hanmail.net\n템플릿: C2')) {
              return;
            }
            
            setLoading(true);
            try {
              const response = await fetch('/api/linkee-mails/test-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  count: 10,
                  recipientEmail: 'wwwbomnal@hanmail.net'
                })
              });

              const result = await response.json();
              
              if (result.success) {
                alert(`테스트 메일이 큐에 등록되었습니다!\n\n등록 수량: ${result.addedCount}개\n수신자: wwwbomnal@hanmail.net\n\n이제 큐 상황에서 발송하실 수 있습니다.`);
              } else {
                alert('테스트 메일 큐 등록 실패: ' + result.message);
              }
            } catch (error) {
              console.error('테스트 메일 큐 등록 오류:', error);
              alert('테스트 메일 큐 등록 중 오류가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-1 rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium text-sm"
        >
          {loading ? '처리 중...' : '테스트용 큐로 보내기'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* 왼쪽: 현황 + 히스토리 */}
        <div className="space-y-6">
          {/* 현황 카드 - 높이 줄임 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              {/* 왼쪽: 1차 캠페인 정보 */}
              <div className="text-left">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  1차 캠페인
                </div>
                <div className="text-sm text-gray-600">
                  {(() => {
                    const firstCampaign = campaigns.find(c => c.campaign_round === '1차');
                    if (firstCampaign) {
                      const date = new Date(firstCampaign.extraction_date);
                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 생성`;
                    }
                    return '아직 생성되지 않음';
                  })()}
                </div>
              </div>
              
              {/* 중앙: 잔여 대상 (큰 글씨) */}
              <div className="text-center flex-1">
                <div className="text-4xl font-bold text-blue-700 mb-1">
                  {(totalTargets - completedCampaigns).toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-blue-600">잔여 대상</div>
              </div>
              
              {/* 오른쪽: 전체 대상 & 홍보활동 (두 줄) */}
              <div className="text-right space-y-1">
                <div className="text-sm">
                  <span className="text-gray-600">전체 대상:</span>
                  <span className="ml-2 font-semibold text-gray-700">{totalTargets.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">홍보활동:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {completedCampaigns.toLocaleString()}개 완료
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 홍보활동 히스토리 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">홍보활동 히스토리</h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  아직 홍보활동이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">발송</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">성공</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">실패</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-3 py-2 text-sm text-center font-medium text-blue-600">
                            {item.total_sent.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-green-600">
                            {item.success_count.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-red-600">
                            {item.failed_count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 메일링 타겟 생성 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">메일링 타겟 생성</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">실행 차수</label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                {(() => {
                  const nextNumber = generateExtractionNumber('1차');
                  return `${nextNumber}차 (자동 생성)`;
                })()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">추출 날짜</label>
              <input
                type="date"
                name="extraction_date"
                value={newCampaign.extraction_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">추출 수량</label>
              <input
                type="number"
                name="target_count"
                value={newCampaign.target_count}
                onChange={handleInputChange}
                placeholder="예: 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <input
                type="text"
                name="notes"
                value={newCampaign.notes}
                onChange={handleInputChange}
                placeholder="예: 오늘 500개 추가 발송 필요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? '처리 중...' : '생성 및 큐로 전송'}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 사용 방법</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. 실행 차수는 자동으로 생성됩니다 (1-1차, 1-2차...)</div>
              <div>2. 추출 날짜와 수량을 설정합니다.</div>
              <div>3. 필요시 메모를 추가합니다.</div>
              <div>4. "생성 및 큐로 전송"을 클릭합니다.</div>
              <div>5. 생성된 타겟은 왼쪽 히스토리에 표시됩니다.</div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default LinkeeMailSendingPage; 