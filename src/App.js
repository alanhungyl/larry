import React, { useState, useEffect } from 'react';
import animeTitles from './newlists';
import 'daisyui/dist/full.css';

const stageList = [128, 64, 32, 16, 8, 4, 2, 1];
const stageLabels = ["128強", "64強", "32強", "16強", "8強", "4強", "FINAL"];

function App() {
  const [remainingAnime, setRemainingAnime] = useState([...animeTitles]);
  const [eliminatedAnime, setEliminatedAnime] = useState([]);
  const [successAnime, setSuccessAnime] = useState([]);
  const [currentPair, setCurrentPair] = useState([]);
  const [stage, setStage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); // New state for reset confirmation modal
  const [eliminationOrder, setEliminationOrder] = useState(new Map());
  const [animeImages, setAnimeImages] = useState({});

  useEffect(() => {
    generateRandomPair();
  }, [remainingAnime]);

  useEffect(() => {
    currentPair.forEach(anime => {
      if (anime && !animeImages[anime]) {
        fetchAnimeImage(anime);
      }
    });
  }, [currentPair]);

  const fetchAnimeImage = async (anime) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v3/search/anime?q=${anime}&limit=1`);
      const data = await response.json();
      const imageUrl = data.results[0]?.image_url || '';
      setAnimeImages(prevImages => ({ ...prevImages, [anime]: imageUrl }));
    } catch (error) {
      console.error('Error fetching anime image:', error);
    }
  };

  const generateRandomPair = () => {
    if (remainingAnime.length < 2) {
      if (successAnime.length === 0) {
        // Add the last remaining anime to the elimination order
        if (remainingAnime.length === 1) {
          setEliminationOrder(new Map(eliminationOrder.set(remainingAnime[0], eliminatedAnime.length + 1)));
        }
        setShowModal(true);
        return;
      }
      setRemainingAnime([...successAnime]);
      setSuccessAnime([]);
      setStage(stage + 1);
      return;
    }

    const shuffled = [...remainingAnime].sort(() => 0.5 - Math.random());
    const pair = shuffled.slice(0, 2);
    if (pair.length === 1) {
      pair.push(null); // Add a blank option if there's only one anime left
    }
    setCurrentPair(pair);
  };

  const handleChoice = (chosenAnime) => {
    const notChosenAnime = currentPair.find(anime => anime !== chosenAnime);
    setSuccessAnime([...successAnime, chosenAnime]);
    setEliminatedAnime([...eliminatedAnime, notChosenAnime]);
    setRemainingAnime(remainingAnime.filter(anime => anime !== chosenAnime && anime !== notChosenAnime));
    setEliminationOrder(new Map(eliminationOrder.set(notChosenAnime, eliminatedAnime.length + 1)));
  };

  const resetChoices = () => {
    setRemainingAnime([...animeTitles]);
    setEliminatedAnime([]);
    setSuccessAnime([]);
    setEliminationOrder(new Map());
    setStage(0);
    setShowModal(false);
    setShowResetModal(false); // Close the reset confirmation modal
    generateRandomPair();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-6xl font-bold py-4">Larry 2選1</p>
      <p className="text-4xl font-bold py-2">{stageLabels[stage]}: {Math.ceil(successAnime.length)} / {stageList[stage]}</p>
      <div className="flex space-x-4"> 
        {currentPair.map((anime, index) => (
          <button
            key={index}
            className={`text-white text-3xl font-bold rounded-3xl ${index === 0 ? 'bg-green-700' : 'bg-blue-700'}`}
            style={{ width: '400px', height: '200px', backgroundImage: anime ? `url(${animeImages[anime]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
            onClick={() => anime && handleChoice(anime)}
          >
            {anime || 'No more options'}
          </button>
        ))}
      </div>
      <button
        className="mt-8 bg-red-700 text-white text-2xl font-bold rounded-3xl" // Increased margin-top to 8
        style={{ width: '200px', height: '50px' }}
        onClick={() => setShowResetModal(true)} // Show reset confirmation modal
      >
        Reset Choices
      </button>

      {showModal && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box p-6">
            <h2 className="text-6xl font-bold mb-4 text-yellow-400">Ranking</h2>
            <ol className="list-decimal pl-5 text-left">
              {[...eliminationOrder.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 16)
                .map(([anime, order], index) => (
                  <li
                    key={index}
                    className={`py-2 ${index === 0 ? 'text-4xl text-orange-500 font-bold' : index === 1 ? 'text-3xl text-orange-400 font-bold' : index === 2 ? 'text-2xl text-orange-300 font-bold' : 'text-2xl'}`}
                  >
                    {anime}
                  </li>
                ))}
            </ol>
            <div className="modal-action">
            </div>
          </div>
          <label className="modal-backdrop" onClick={() => setShowModal(false)}>Close</label>
        </div>
      )}

      {showResetModal && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box p-6">
            <h2 className="text-4xl font-bold mb-4">Confirm Reset</h2>
            <p className="text-2xl mb-4">Are you sure you want to reset the choices?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white text-xl font-bold rounded-3xl px-4 py-2"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-700 text-white text-xl font-bold rounded-3xl px-4 py-2"
                onClick={resetChoices}
              >
                Confirm
              </button>
            </div>
          </div>
          <label className="modal-backdrop" onClick={() => setShowResetModal(false)}>Close</label>
        </div>
      )}
    </div>
  );
}

export default App;