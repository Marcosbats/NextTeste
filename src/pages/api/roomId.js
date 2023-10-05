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
        hostWallets: ['0xF6416a940DF83fFD9122Cc4B70061962B9A7551b'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'CP34FLALAAUQq_k_1TnVWSoZ15FPthBI',
          //BAdSLnTDw3WtUUUf299r0GDHNw5nlKy3
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