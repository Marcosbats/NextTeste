import axios from 'axios';

export async function createRoom() {
  try {
    // Verifique se o roomId já está no sessionStorage
    const existingRoomId = sessionStorage.getItem('roomId');
    if (existingRoomId) {
      console.log('Room ID já foi gerado:', existingRoomId);
      return existingRoomId;
    }

    const response = await axios.post(
      'https://api.huddle01.com/api/v1/create-room',
      {
        title: 'Huddle01-Test',
        hostWallets: ['0x4f9116B27Fda2496DCb6AC5bEE4A608dC40187D5'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'JbArIwMfUBGW_HnQmNGaIaGqVrSt5xIn',
        },
      }
    );

    console.log('Resposta completa da API:', response);

    if (response.status === 200) {
      const responseData = response.data;
      const roomId = responseData.data.roomId.toString();
      sessionStorage.setItem('roomId', roomId);

      console.log('Room ID:', roomId);
      return roomId;
    } else {
      console.error('Erro ao criar sala');
    }
  } catch (error) {
    console.error('Erro na solicitação:', error);
  }
}