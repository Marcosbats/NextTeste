  
  async function createRoom() {
    try {
      const response = await axios.post(
        'https://api.huddle01.com/api/v1/create-room',
        {
          title: 'Huddle01-Test',
          hostWallets: ['0x3f995668cd2Ad830BD06ee873A49Be10139c3000'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'JbArIwMfUBGW_HnQmNGaIaGqVrSt5xIn',
          },              
        }
      );
  
      if (response.status === 200) {
        const responseData = response.data;
        const roomId = responseData.data.roomId;
        joinLobby(roomId)
        // Agora você tem o roomId, e pode usá-lo como necessário
        console.log('Room ID:', roomId);
  
        // Por exemplo, você pode atualizar o estado de um componente React
        // ou executar alguma outra lógica com o roomId
      } else {
        console.error('Erro ao criar sala');
      }
    } catch (error) {
      console.error('Erro na solicitação:', error);
    }
  }
  
  createRoom();