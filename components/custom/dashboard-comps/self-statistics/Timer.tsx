
import { useState, useEffect } from "react";

const TimerComponent: React.FC = () => {
  const [seconds, setSeconds] = useState(0); // Total elapsed seconds
  const [isRunning, setIsRunning] = useState(false); // Track if timer is running

  // Start the timer
  const startTimer = () => setIsRunning(true);

  // Stop the timer
  const stopTimer = () => setIsRunning(false);

  // Reset the timer
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000); // Increment seconds every second
    }

    return () => {
      if (timer) clearInterval(timer); // Clean up the interval on unmount or when isRunning changes
    };
  }, [isRunning]);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;


  return (
    <div>
      <h1>
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {remainingSeconds.toString().padStart(2, "0")}
      </h1>
      <button onClick={startTimer} disabled={isRunning}>
        Start
      </button>
      <button onClick={stopTimer} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default TimerComponent;


// import { useState, useEffect } from "react";

// const TimerComponent: React.FC = () => {
//   const totalHours = 8; // Set total hours for the timer
//   const totalSeconds = totalHours * 3600; // Convert total hours to seconds

//   const [elapsedSeconds, setElapsedSeconds] = useState(0); // Track elapsed seconds
//   const [isRunning, setIsRunning] = useState(false); // Track if timer is running

//   // Start the timer
//   const startTimer = () => setIsRunning(true);

//   // Stop the timer
//   const stopTimer = () => setIsRunning(false);

//   // Reset the timer
//   const resetTimer = () => {
//     setIsRunning(false);
//     setElapsedSeconds(0);
//   };

//   // Use useEffect to handle the timer updates
//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;

//     if (isRunning) {
//       timer = setInterval(() => {
//         setElapsedSeconds((prev) => {
//           if (prev < totalSeconds) {
//             return prev + 1; // Increment elapsed seconds
//           } else {
//             clearInterval(timer!); // Stop the timer when total time is reached
//             return prev;
//           }
//         });
//       }, 1000); // Increment seconds every second
//     }

//     return () => {
//       if (timer) clearInterval(timer); // Clean up the interval
//     };
//   }, [isRunning, totalSeconds]);

//   // Calculate remaining time
//   const remainingSeconds = totalSeconds - elapsedSeconds;
//   const remainingHours = Math.floor(remainingSeconds / 3600);
//   const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
//   const remainingSecs = remainingSeconds % 60;

//   return (
//     <div>
//       <h1>
//         Remaining Time: {remainingHours.toString().padStart(2, "0")}:
//         {remainingMinutes.toString().padStart(2, "0")}:
//         {remainingSecs.toString().padStart(2, "0")}
//       </h1>
//       <button onClick={startTimer} disabled={isRunning}>
//         Start
//       </button>
//       <button onClick={stopTimer} disabled={!isRunning}>
//         Stop
//       </button>
//       <button onClick={resetTimer}>Reset</button>
//     </div>
//   );
// };

// export default TimerComponent;