

const Lobby = ({ onJoin }) => (
  <div className="text-center mt-20">
    <h1 className="text-2xl font-bold mb-4">Welcome to the Lobby</h1>
    <Button onClick={onJoin}>Join Room</Button>
  </div>
);

export default Lobby;
