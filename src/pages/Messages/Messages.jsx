import { useState } from 'react';
import Avatar from '../../components/Avatar/Avatar';
import { useApp } from '../../context/AppContext';
import './Messages.css';

const THREADS = [
  { id: 't1', name: 'Ananya Sharma', initials: 'AS', last: 'Is the price negotiable?', time: '2m', unread: 2, online: true, product: 'Engineering Mathematics' },
  { id: 't2', name: 'Rohan Mehta', initials: 'RM', last: 'Great, I can pick it up tomorrow', time: '1h', unread: 0, online: true, product: 'MacBook Air M1' },
  { id: 't3', name: 'Priya Nair', initials: 'PN', last: 'Sounds good, thank you!', time: '3h', unread: 0, online: false, product: 'Lab Coat Combo' },
  { id: 't4', name: 'Karan Sethi', initials: 'KS', last: 'Can you share more photos?', time: '1d', unread: 1, online: false, product: 'Study Table Set' },
  { id: 't5', name: 'Simran Kaur', initials: 'SK', last: 'Perfect, see you at the gate', time: '2d', unread: 0, online: false, product: 'Denim Jacket' },
];

const SAMPLE_MESSAGES = {
  t1: [
    { from: 'them', text: 'Hi! Is the Engineering Mathematics book still available?', time: '10:02 AM' },
    { from: 'me', text: 'Yes it is! Are you looking for it?', time: '10:05 AM' },
    { from: 'them', text: 'Yes, is the price negotiable?', time: '10:06 AM' },
  ],
};

export default function Messages() {
  const { showToast, addNotification } = useApp();
  const [activeId, setActiveId] = useState('t1');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const active = THREADS.find((t) => t.id === activeId);
  const thread = messages[activeId] || [];

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const sentText = draft;
    setMessages((m) => ({
      ...m,
      [activeId]: [...(m[activeId] || []), { from: 'me', text: sentText, time: 'Now' }],
    }));
    setDraft('');

    // Simulate reply and notification after 2s
    setTimeout(() => {
      const replyMsg = `Thanks for your message! Let's arrange a time to meet up.`;
      setMessages((m) => ({
        ...m,
        [activeId]: [...(m[activeId] || []), { from: 'them', text: replyMsg, time: 'Now' }],
      }));
      addNotification(`${active.name} sent you a message: "${replyMsg}"`, 'message');
      showToast(`New message from ${active.name}`);
    }, 2000);
  };

  return (
    <div className="cm-msg">
      <aside className="cm-msg__sidebar">
        <div className="cm-msg__sidebar-head">
          <h2>Messages</h2>
        </div>
        <div className="cm-msg__threads">
          {THREADS.map((t) => (
            <button key={t.id} className={`cm-msg__thread ${activeId === t.id ? 'is-active' : ''}`} onClick={() => setActiveId(t.id)}>
              <Avatar initials={t.initials} size={46} online={t.online} />
              <div className="cm-msg__thread-info">
                <div className="cm-msg__thread-top"><strong>{t.name}</strong><span>{t.time}</span></div>
                <div className="cm-msg__thread-bottom">
                  <span className="cm-msg__product">{t.product}</span>
                </div>
                <p>{t.last}</p>
              </div>
              {t.unread > 0 && <span className="cm-msg__unread">{t.unread}</span>}
            </button>
          ))}
        </div>
      </aside>

      <section className="cm-msg__chat">
        <div className="cm-msg__chat-head">
          <Avatar initials={active.initials} size={40} online={active.online} />
          <div>
            <strong>{active.name}</strong>
            <span>{active.online ? 'Online now' : 'Offline'} · about "{active.product}"</span>
          </div>
        </div>

        <div className="cm-msg__body">
          {thread.length === 0 ? (
            <p className="cm-msg__empty">Say hi to start the conversation about {active.product}.</p>
          ) : thread.map((m, i) => (
            <div key={i} className={`cm-bubble cm-bubble--${m.from}`}>
              <p>{m.text}</p>
              <span>{m.time}</span>
            </div>
          ))}
        </div>

        <form className="cm-msg__input" onSubmit={send}>
          <input
            type="text"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="button" onClick={() => showToast('Attachments coming soon')} aria-label="Attach file">📎</button>
          <button type="submit" aria-label="Send message">➤</button>
        </form>
      </section>
    </div>
  );
}
