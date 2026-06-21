import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryPage.css';
import { SendIcon, MoreOptionsIcon } from '../../../assets/icons/PromptSection';

interface EntryPageState {
  input: string;
}

export default function EntryPage() {
  const [state, setState] = useState<EntryPageState>({
    input: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, input: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Submitting: "${state.input}"`);
    navigate('/main');
  };

  const handleMoreOptions = () => {
    console.log('Plus button clicked');
  };

  const handleSend = () => {
    console.log('Send button clicked');
  };

  return (
    <main className="entry-page">
      <section className="entry-container">
        <h1 className="greeting">Semantic OS</h1>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <button
              className="plus-button"
              type="button"
              onClick={handleMoreOptions}
              title="More options"
            >
              <MoreOptionsIcon />
            </button>
            
            <input
              type="text"
              className="search-input"
              placeholder="How can I help you today?"
              value={state.input}
              onChange={handleInputChange}
            />

            <button
              className="send-button"
              type="submit"
              title="Send"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
