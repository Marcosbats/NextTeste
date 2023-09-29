import Link from 'next/link';
import styles from './styles.module.scss'
import { useHuddle01, useRoom } from '@huddle01/react/hooks';

interface ModalProps {
  onClose: () => void;         
}

export function ModalEndRoom({ onClose }: ModalProps) {
  const { endRoom } = useRoom();
  const { initialize, roomState } = useHuddle01();

  const endButton = () => {
    endRoom();
    onClose();
   // window.location.href = 'https://ibeed.xyz/comunidade';
  }

  return (
    <main className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <p>Essa ação vai encerrar a sala de todos os usuários</p>            
        <div className={styles.buttonContainer}>
          <button onClick={endButton}>SIM</button>
          <button onClick={onClose}>NÃO</button>     
        </div>
      </div>
    </main>
  );
};