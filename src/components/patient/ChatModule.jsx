import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

export default function ChatModule({ user, senderLabel = 'Paciente' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    const { data, error: loadError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setMessages(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    setSending(true);
    const sender = senderLabel === 'Fisioterapeuta' ? 'Fisioterapeuta' : 'Paciente';
    const { error: sendError } = await supabase.from('messages').insert([
      {
        sender,
        text: cleanText,
      },
    ]);

    if (sendError) {
      setError(sendError.message);
    } else {
      setText('');
      await loadMessages();
    }
    setSending(false);
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Chat realtime"
        title={senderLabel === 'Fisioterapeuta' ? 'Responder consultas' : 'Chat directo con el fisio'}
        description="Los mensajes se sincronizan con la tabla messages mediante Supabase Realtime."
      />

      {error && <Alert type="error">Error en el chat: {error}</Alert>}

      <div className="mt-4 h-80 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
        {loading ? (
          <p className="text-center text-sm text-slate-400">Cargando conversación...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">Aún no hay mensajes. Inicia la conversación.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isOwn = message.sender === senderLabel;
              return (
                <article
                  key={message.id || `${message.created_at}-${index}`}
                  className={`max-w-[85%] rounded-3xl border px-4 py-3 text-sm shadow-sm ${
                    isOwn
                      ? 'ml-auto border-sky-100 bg-sky-600 text-right text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p className={`mb-1 text-xs font-black ${isOwn ? 'text-sky-100' : 'text-sky-700'}`}>
                    {message.sender || 'Usuario'}
                  </p>
                  <p className="leading-6">{message.text}</p>
                </article>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Escribe como ${senderLabel.toLowerCase()}...`}
          required
        />
        <button type="submit" className="btn-secondary sm:w-40" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-400">Conectado como {user?.email}.</p>
    </section>
  );
}
