import React, { useState, useEffect } from 'react';

const CatchingServiceSalespersonPage = () => {
  const [services, setServices] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [serviceForm, setServiceForm] = useState({ name: '', identifier: '' });
  const [salespersonForm, setSalespersonForm] = useState({ name: '', identifier: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', identifier: '' });

  // 데이터 로드
  useEffect(() => {
    loadServices();
    loadSalespersons();
    loadCompanies();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('서비스 목록 로드 오류:', error);
    }
  };

  const loadSalespersons = async () => {
    try {
      const response = await fetch('/api/salespersons');
      const data = await response.json();
      setSalespersons(data);
    } catch (error) {
      console.error('영업자 목록 로드 오류:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('제휴사 목록 로드 오류:', error);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (serviceForm.name && serviceForm.identifier) {
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceForm)
        });
        
        if (response.ok) {
          setServiceForm({ name: '', identifier: '' });
          loadServices();
        } else {
          const error = await response.json();
          alert(error.error || '서비스 등록 실패');
        }
      } catch (error) {
        console.error('서비스 등록 오류:', error);
        alert('서비스 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSalespersonSubmit = async (e) => {
    e.preventDefault();
    if (salespersonForm.name && salespersonForm.identifier) {
      try {
        const response = await fetch('/api/salespersons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salespersonForm)
        });
        
        if (response.ok) {
          setSalespersonForm({ name: '', identifier: '' });
          loadSalespersons();
        } else {
          const error = await response.json();
          alert(error.error || '영업자 등록 실패');
        }
      } catch (error) {
        console.error('영업자 등록 오류:', error);
        alert('영업자 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (companyForm.name && companyForm.identifier) {
      try {
        const response = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyForm)
        });
        
        if (response.ok) {
          setCompanyForm({ name: '', identifier: '' });
          loadCompanies();
        } else {
          const error = await response.json();
          alert(error.error || '제휴사 등록 실패');
        }
      } catch (error) {
        console.error('제휴사 등록 오류:', error);
        alert('제휴사 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const toggleActive = async (type, id) => {
    try {
      const endpoint = type === 'service' ? 'services' : type === 'salesperson' ? 'salespersons' : 'companies';
      const response = await fetch(`/api/${endpoint}/${id}/toggle`, { method: 'PUT' });
      
      if (response.ok) {
        if (type === 'service') loadServices();
        else if (type === 'salesperson') loadSalespersons();
        else if (type === 'company') loadCompanies();
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
    }
  };

  const deleteItem = async (type, id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const endpoint = type === 'service' ? 'services' : type === 'salesperson' ? 'salespersons' : 'companies';
      const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        if (type === 'service') loadServices();
        else if (type === 'salesperson') loadSalespersons();
        else if (type === 'company') loadCompanies();
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="pt-6 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 pl-2">서비스 영업자 관리</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 서비스 등록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-blue-600 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-white">서비스 등록</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleServiceSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="서비스명"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="식별자"
                  value={serviceForm.identifier}
                  onChange={(e) => setServiceForm({...serviceForm, identifier: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">서비스 목록</h3>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1 flex items-center">
                      <span className="w-1/3 font-medium truncate">{service.name}</span>
                      <span className="w-1/3 text-left text-gray-600 truncate ml-12">{service.identifier}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end w-1/3">
                      <span className={`px-2 py-1 rounded text-xs ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {service.active ? '활성' : '비활성'}
                      </span>
                      <button 
                        onClick={() => toggleActive('service', service.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteItem('service', service.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 영업자 등록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-green-600 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-white">영업자 등록</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSalespersonSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="영업자명"
                  value={salespersonForm.name}
                  onChange={(e) => setSalespersonForm({...salespersonForm, name: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="식별자"
                  value={salespersonForm.identifier}
                  onChange={(e) => setSalespersonForm({...salespersonForm, identifier: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">영업자 목록</h3>
              <div className="space-y-2">
                {salespersons.map((salesperson) => (
                  <div key={salesperson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1 flex items-center">
                      <span className="w-1/3 font-medium truncate">{salesperson.name}</span>
                      <span className="w-1/3 text-left text-gray-600 truncate ml-12">{salesperson.identifier}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end w-1/3">
                      <span className={`px-2 py-1 rounded text-xs ${salesperson.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {salesperson.active ? '활성' : '비활성'}
                      </span>
                      <button 
                        onClick={() => toggleActive('salesperson', salesperson.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteItem('salesperson', salesperson.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 제휴사 등록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-purple-600 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-white">제휴사 등록</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleCompanySubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="제휴사명"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="식별자"
                  value={companyForm.identifier}
                  onChange={(e) => setCompanyForm({...companyForm, identifier: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white py-2 px-4 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
          <div className="border-t border-gray-200">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">제휴사 목록</h3>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1 flex items-center">
                      <span className="w-1/3 font-medium truncate">{company.name}</span>
                      <span className="w-1/3 text-left text-gray-600 truncate ml-12">{company.identifier}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end w-1/3">
                      <span className={`px-2 py-1 rounded text-xs ${company.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {company.active ? '활성' : '비활성'}
                      </span>
                      <button 
                        onClick={() => toggleActive('company', company.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteItem('company', company.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatchingServiceSalespersonPage; 