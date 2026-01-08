import React, { useState } from 'react';

function ResetPasswordPage() {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Xử lý logic gửi email đặt lại mật khẩu ở đây
    console.log('Password reset requested for:', email);
    // Có thể hiển thị một thông báo thành công sau khi gửi
  };

  return (
    // Áp dụng font Inter, màu nền chính và căn giữa nội dung
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center font-inter p-4 text-text-primary">
      
      {/* Container chính bao gồm logo và form */}
      <main className="flex flex-col items-center w-full animate-fade-in">
        
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="bg-accent p-3 rounded-xl mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Producer Workbench</h1>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-dark-surface rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Đặt lại mật khẩu của bạn</h2>
            <p className="text-text-secondary mb-8">
              Đừng lo lắng, chuyện này vẫn thường xảy ra. Hãy nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-2" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="w-full bg-[#2c2d3c] border border-border-color text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Nhập địa chỉ email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-8 hover:bg-opacity-90 transition-colors"
            >
              Gửi liên kết
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-text-secondary hover:text-accent transition-colors">
              &larr; Quay lại trang Đăng nhập
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-text-secondary text-sm">
        &copy; {new Date().getFullYear()} Producer Workbench. All rights reserved.
      </footer>
    </div>
  );
}

export default ResetPasswordPage;