import axios from 'axios';

export async function createToken() {
  const roomId = sessionStorage.getItem('roomId');
  //const guestAsHost = true; // Defina como 'true' se deseja que o usuário que entrar primeiro seja o anfitrião

  const response = await axios.post(
    'https://api.huddle01.com/api/v1/join-room-token',
    {
      roomId: roomId,
      userType: 'host'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'CP34FLALAAUQq_k_1TnVWSoZ15FPthBI',
      },
    }
  );
  console.log('Resposta create Token:', response.data);

  if (response.status === 200) {
    const token = response.data.token;
   
    console.log('Agoraaa:', token);
    return token;
  } else {
    console.error('Erro ao criar Token');
  }
}