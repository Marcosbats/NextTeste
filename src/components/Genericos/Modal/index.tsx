import React, { useEffect } from 'react'
import Link from 'next/link'
import styles from './styles.module.scss'
import { useState } from 'react'
import { useDisplayName } from "@huddle01/react/app-utils";
import { useHuddle01, useRoom } from '@huddle01/react/hooks';
import { Loading } from '../../Genericos/Loading'

interface ModalProps {
    onClose: () => void; 
    onNameSubmit: (name: string) => void;    
}

export function ModalAuditorio({ onClose, onNameSubmit }: ModalProps) {
  const { setDisplayName, error: displayNameError } = useDisplayName();
  const [displayNameText, setDisplayNameText] = useState(" ");
  const { joinRoom} = useRoom();
  const { roomState } = useHuddle01();

   const handleRoomButtonClick = () => {
    if (roomState.valueOf() === 'LOBBY') {
      try {
        joinRoom();
      } catch (error) {
        console.error('Erro:', error);
      }
    } else if  (roomState.valueOf() === 'ROOM') {
      let errorMessage = '';
    
      if (displayNameText.trim() === '') {
        errorMessage = 'Nome não pode estar em branco.';
      } else if (displayNameText.length < 5) {
        errorMessage = 'Nome deve ter pelo menos 5 caracteres.';
      } else if (displayNameText.length > 8) {
        errorMessage = 'Nome deve ter no máximo 8 caracteres.';
      } else if (/(.)\1\1/.test(displayNameText)) {
        errorMessage = 'Nome não pode conter três caracteres iguais seguidos.';
      }
    
      if (errorMessage) {
        // Lidar com o erro, como exibir a mensagem para o usuário
        console.error('Erro:', errorMessage);
        // Aqui você pode exibir a mensagem de erro onde for apropriado em sua interface do usuário
      } else {
        // O nome é válido, execute a lógica de sucesso
        onNameSubmit(displayNameText);
        setDisplayName(displayNameText);
        onClose();
      }
    }
   };

  const buttonLabelRoom = () => {
    if (roomState === 'INIT') {
      return (
        <div>
          <Loading /> Conectando...
        </div>
      );
    } else if (roomState === 'LOBBY') {
      return 'ENTRAR NA SALA';
    } else if (roomState === 'ROOM') {
      return 'CADASTRE SEU NOME';
    }  
  };

  return (
    <main className={styles.modalContainer}>
      <div className={styles.modalContent}>
      {roomState === "ROOM" ? (
        <React.Fragment>
           <h2>Insira seu nome</h2>
          <input
            type="text"
            placeholder=" Digite seu Nome"
            value={displayNameText}
            onChange={(e) => setDisplayNameText(e.target.value)}
            className={styles.inputContainer}
          />
        </React.Fragment>
      ) : null}         
        <button
          disabled={!joinRoom.isCallable && !setDisplayName.isCallable  }
          onClick={handleRoomButtonClick}
        >
          {buttonLabelRoom()}
        </button>       
      </div>
    </main>
  );
};