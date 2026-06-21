import { useState } from 'react';
import './EntryPage.css';

interface EntryPageState {
  input: string;
}

export default function EntryPage() {
  const [state, setState] = useState<EntryPageState>({
    input: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, input: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Submitting: "${state.input}"`);
  };

  const handleMoreOptions = () => {
    console.log('Plus button clicked');
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
              title="Add"
            >
              +
            </button>
            
            <input
              type="text"
              className="search-input"
              placeholder="How can I help you today?"
              value={state.input}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </section>
    </main>
  );
}
