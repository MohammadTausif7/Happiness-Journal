const days = [
  { day: "27", faded: true },
  { day: "28", faded: true },
  { day: "29", faded: true },
  { day: "30", faded: true },
  { day: "1" },
  { day: "2", mood: "calm", emoji: "😌" },
  { day: "3" },
  { day: "4", mood: "happy", emoji: "😊" },
  { day: "5" },
  { day: "6" },
  { day: "7", mood: "love", emoji: "🥰" },
  { day: "8" },
  { day: "9", mood: "sad", emoji: "😔" },
  { day: "10" },
  { day: "11" },
  { day: "12" },
  { day: "13", mood: "happy", emoji: "🤩" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17", mood: "calm", emoji: "🙂" },
  { day: "18" },
  { day: "19" },
  { day: "20" },
  { day: "21", mood: "love", emoji: "😍" },
  { day: "22" },
  { day: "23" },
  { day: "24" },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" },
  { day: "31" },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProductPreview() {
  return (
    <div aria-label="Preview of the Happiness Journal calendar" className="preview-wrap">
      <div className="preview-glow preview-glow-one" />
      <div className="preview-glow preview-glow-two" />
      <div className="app-window">
        <div className="window-bar">
          <div aria-hidden="true" className="window-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="window-title">My journal</span>
          <div className="avatar">MA</div>
        </div>

        <div className="app-body">
          <aside className="preview-sidebar">
            <div className="mini-brand">H</div>
            <span className="side-item active">⌑</span>
            <span className="side-item">♡</span>
            <span className="side-item">◌</span>
          </aside>

          <div className="calendar-panel">
            <div className="calendar-toolbar">
              <div>
                <span className="eyebrow">YOUR MONTH</span>
                <h2>May 2026</h2>
              </div>
              <button className="preview-new-button" tabIndex={-1} type="button">
                <span>＋</span> New moment
              </button>
            </div>

            <div className="calendar-grid">
              {weekDays.map((day) => (
                <div className="weekday" key={day}>
                  {day}
                </div>
              ))}
              {days.map((item, index) => (
                <div
                  className={`calendar-day ${item.faded ? "faded" : ""} ${item.mood ? `mood-${item.mood}` : ""}`}
                  key={`${item.day}-${index}`}
                >
                  <span>{item.day}</span>
                  {item.emoji && <b>{item.emoji}</b>}
                  {item.mood === "happy" && <i className="day-sparkle">✦</i>}
                  {item.mood === "love" && <i className="day-heart">♥</i>}
                  {item.mood === "sad" && <i className="day-rain">•••</i>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="floating-note">
        <span className="floating-note-emoji">😊</span>
        <span>
          <strong>A really good Tuesday</strong>
          <small>Lunch outside, no rush.</small>
        </span>
      </div>

      <div aria-hidden="true" className="demo-cursor">
        <svg fill="none" viewBox="0 0 28 34">
          <path d="M2 2v25l7-6 4 10 5-2-4-10h9L2 2Z" fill="#27251F" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
