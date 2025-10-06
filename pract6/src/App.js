import { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Check, X, Trash2, Filter, AlertCircle, Circle, Zap, Mic, MicOff } from 'lucide-react';
import './App.css';
export default function App() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTask(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        setVoiceError(event.error === 'not-allowed' ?
          'Microphone access denied. Please allow microphone access.' :
          'Voice recognition error. Please try again.'
        );
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setVoiceError('Voice recognition failed to start.');
      }
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  const priorityConfig = {
    high: {
      label: 'High',
      color: 'high-priority',
      icon: AlertCircle
    },
    medium: {
      label: 'Medium',
      color: 'medium-priority',
      icon: Circle
    },
    low: {
      label: 'Low',
      color: 'low-priority',
      icon: Zap
    }
  };
  const handleAddTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now(),
        text: task.trim(),
        priority,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
      setTask('');
      setPriority('medium');
    }
  };
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };
  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };
  const handleAllClear = () => {
    setTasks([]);
    setEditingId(null);
    setEditingText('');
    setFilterPriority('all');
  };
  const handleStartEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };
  const handleSaveEdit = (id) => {
    if (editingText.trim()) {
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, text: editingText.trim() } : t
      ));
    }
    setEditingId(null);
    setEditingText('');
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };
  const getPriorityOrder = (priority) => {
    const order = { high: 3, medium: 2, low: 1 };
    return order[priority] || 0;
  };
  const filteredTasks = tasks
    .filter(task => filterPriority === 'all' || task.priority === filterPriority)
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
    });
  const taskCounts = {
    all: tasks.length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };
  return (
    <div className="app-container">
      <div className="app-content">
        <div className="header">
          <h1 className="title">Task Manager</h1>
          <p className="subtitle">Stay organized and productive with voice input</p>
        </div>
        <div className="form-container">
          <div className="form-content">
            <div className="input-row">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddTask)}
                placeholder="What needs to be done?"
                className="task-input"
              />
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`voice-btn ${isListening ? 'voice-btn-listening' : ''}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="priority-select"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            {isListening && (
              <div className="voice-status">
                <div className="listening-indicator"></div>
                Listening... Speak now
              </div>
            )}
            {voiceError && (
              <div className="error-message">
                {voiceError}
              </div>
            )}
            {!isSupported && (
              <div className="warning-message">
                Voice input is not supported in your browser. Please use Chrome, Safari, or Edge.
              </div>
            )}
            <button
              onClick={handleAddTask}
              disabled={!task.trim()}
              className="add-btn"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>
        <div className="filter-container">
          <div className="filter-header">
            <Filter size={20} />
            <span>Filter by Priority</span>
          </div>
          <div className="filter-buttons">
            {['all', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`filter-btn ${filterPriority === p ? 'filter-btn-active' : ''}`}
              >
                {p === 'all' ? 'All' : priorityConfig[p].label}
                <span className="filter-count">({taskCounts[p]})</span>
              </button>
            ))}
          </div>
        </div>
        {tasks.length > 0 && (
          <div className="clear-all-container">
            <button
              onClick={handleAllClear}
              className="clear-all-btn"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        )}
        <div className="tasks-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-message">
                {filterPriority === 'all'
                  ? "No tasks yet. Add one above to get started!"
                  : `No ${priorityConfig[filterPriority]?.label.toLowerCase()} priority tasks found.`
                }
              </div>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const config = priorityConfig[t.priority];
              const Icon = config.icon;
              return (
                <div
                  key={t.id}
                  className={`task-item ${config.color} ${t.completed ? 'task-completed' : ''}`}
                >
                  <div className="task-content">
                    <button
                      onClick={() => handleToggleComplete(t.id)}
                      className={`complete-toggle ${t.completed ? 'complete-toggle-checked' : ''}`}
                    >
                      {t.completed && <Check size={14} />}
                    </button>
                    <div className={`priority-badge priority-badge-${t.priority}`}>
                      <Icon size={14} />
                      <span>{config.label}</span>
                    </div>
                    <div className="task-text-container">
                      {editingId === t.id ? (
                        <div className="edit-container">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, () => handleSaveEdit(t.id))}
                            className="edit-input"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(t.id)}
                            className="edit-save-btn"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="edit-cancel-btn"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className={`task-text ${t.completed ? 'task-text-completed' : ''}`}>
                          {t.text}
                        </span>
                      )}
                    </div>
                    {editingId !== t.id && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleStartEdit(t.id, t.text)}
                          className="edit-btn"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {tasks.length > 0 && (
          <div className="stats-container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number stat-total">{tasks.length}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-completed">
                  {tasks.filter(t => t.completed).length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-pending">
                  {tasks.filter(t => !t.completed).length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-high-priority">
                  {tasks.filter(t => t.priority === 'high' && !t.completed).length}
                </div>
                <div className="stat-label">High Priority</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}