import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import icon from '../../../assets/icons/256x256.png';
import ChatView from './ChatExplorer/ChatView';

export default function MainPage() {
  const navigate = useNavigate();

  const handleBackToEntry = () => {
    navigate('/');
  };

  return (
    <main className="main-page">
      <button
        className="back-to-entry-button"
        onClick={handleBackToEntry}
        title="Back to entry page"
      >
        <img src={icon} alt="Semantic OS" />
      </button>

      <ChatView />
    </main>
  );
}
