
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

import { ToastType } from '../components/Toast';

interface LoginProps {
  onLogin: () => void;
  notify: (message: string, type: ToastType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, notify }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        notify(error.message, 'error');
      } else {
        onLogin();
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regEmail && regPhone && regPassword && regPassword === regConfirmPassword) {
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            phone: regPhone
          }
        }
      });
      if (error) {
        notify(error.message, 'error');
      } else {
        notify('Conta criada com sucesso! Faça login para continuar.', 'success');
        setMode('login');
      }
    } else if (regPassword !== regConfirmPassword) {
      notify('As senhas não coincidem!', 'error');
    } else {
      notify('Por favor, preencha todos os campos.', 'info');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand px-8 pt-12 animate-in fade-in duration-700 overflow-y-auto pb-10">
      <div className="flex flex-col items-center mb-10 shrink-0">
        <div className="size-20 bg-black rounded-[24px] flex items-center justify-center mb-4 shadow-xl border border-white/10">
          <span className="material-symbols-outlined text-brand text-4xl fill-icon">payments</span>
        </div>
        <h1 className="text-black font-black text-xs tracking-[0.3em] uppercase">GANHOS UBER / 99</h1>
      </div>

      {mode === 'login' ? (
        <div className="animate-in slide-in-from-right duration-300">
          <h2 className="text-xl font-black text-black mb-6">Acesse sua conta</h2>
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl">mail</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl active:text-black"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-black text-black uppercase tracking-wider hover:opacity-80 transition-opacity">
                Esqueci minha senha
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full h-14 bg-black rounded-2xl text-brand font-black uppercase text-sm tracking-widest shadow-lg active:scale-[0.98] transition-all"
              >
                Entrar
              </button>

              <div className="text-center">
                <p className="text-xs font-bold text-black/60">
                  Não tem uma conta? <button type="button" onClick={() => setMode('signup')} className="text-black font-black ml-1 hover:underline underline-offset-4">Criar uma conta</button>
                </p>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-in slide-in-from-left duration-300">
          <h2 className="text-xl font-black text-black mb-6">Criar nova conta</h2>
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl">mail</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Telefone</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl">call</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Escolha uma senha"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl active:text-black"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full h-14 bg-white border border-black/10 rounded-xl px-5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-xl active:text-black"
                >
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                className="w-full h-14 bg-black rounded-2xl text-brand font-black uppercase text-sm tracking-widest shadow-lg active:scale-[0.98] transition-all"
              >
                Criar Conta
              </button>

              <div className="text-center">
                <p className="text-xs font-bold text-black/60">
                  Já tem uma conta? <button type="button" onClick={() => setMode('login')} className="text-black font-black ml-1 hover:underline underline-offset-4">Entrar</button>
                </p>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
