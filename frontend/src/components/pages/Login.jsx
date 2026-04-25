import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Login({ setIsLoggedIn }) {
  const [id, setId] = useState('maclee');
  const [pw, setPw] = useState('TanTan2025!');
  const [error, setError] = useState('');
  const navigate = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (id === 'maclee' && pw === 'TanTan2025!') {
      setIsLoggedIn(true);
      navigate('/main');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-8 text-center">
        <div className="text-5xl font-extrabold text-gray-900 mb-2">Digo</div>
        <div className="text-lg font-semibold text-gray-600 tracking-wide">고객 접점 관리 시스템</div>
      </div>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-3">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={e => setId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button type="submit" className="w-full bg-black text-white py-2 rounded font-bold">로그인</button>
      </form>
    </div>
  );
}

export default Login; 