import React, { useState, useEffect, useRef } from 'react';
import styles from './AlarmClock.module.css';
import audio from '../../public/alarm-clock-90867.mp3';

const AlarmClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [alarmTime, setAlarmTime] = useState('');
    const [isAlarmSet, setIsAlarmSet] = useState(false);
    const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
    const [alarms, setAlarms] = useState([]);
    const [showToast, setShowToast] = useState(false);

    const clockRef = useRef(null);
    const audioRef = useRef(null);

    // Update current time every second
    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Check alarms with each time update
            checkAlarms(now);
        }, 1000);

        return () => clearInterval(timerId);
    }, [alarms]);

    // Handle toast message
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const checkAlarms = (currentDate) => {
        // Format the current time to match the alarm time format (HH:MM)
        const hours = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        const currentTimeString = `${hours}:${minutes}`;

        // Debug
        console.log("Checking alarms:", currentTimeString, alarms);

        alarms.forEach(alarm => {
            if (alarm.time === currentTimeString && !alarm.triggered) {
                console.log("Alarm triggered:", alarm);
                triggerAlarm(alarm.id);
            }
        });
    };

    const handleAlarmTimeChange = (e) => {
        setAlarmTime(e.target.value);
    };

    const setAlarm = () => {
        if (alarmTime) {
            const newAlarm = {
                id: Date.now(),
                time: alarmTime,
                triggered: false
            };

            console.log("Setting new alarm:", newAlarm);
            setAlarms([...alarms, newAlarm]);
            setIsAlarmSet(true);
            setAlarmTime('');
            setShowToast(true);
        }
    };

    const triggerAlarm = (id) => {
        console.log("Triggering alarm with id:", id);
        setIsAlarmTriggered(true);

        // Update alarm to triggered state
        const updatedAlarms = alarms.map(alarm =>
            alarm.id === id ? { ...alarm, triggered: true } : alarm
        );
        setAlarms(updatedAlarms);

        // Play sound
        if (audioRef.current) {
            console.log("Playing audio");
            audioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        } else {
            console.error("Audio ref not found");
        }
    };

    const stopAlarm = () => {
        setIsAlarmTriggered(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const resetAlarm = (id) => {
        // Reset the triggered state of the alarm so it can trigger again
        const updatedAlarms = alarms.map(alarm =>
            alarm.id === id ? { ...alarm, triggered: false } : alarm
        );
        setAlarms(updatedAlarms);
    };

    const deleteAlarm = (id) => {
        setAlarms(alarms.filter(alarm => alarm.id !== id));
    };

    return (
        <div className={styles.alarmClockContainer}>
            <div
                ref={clockRef}
                className={`${styles.clockFace} ${isAlarmTriggered ? styles.alarmActive : ''}`}
            >
                <h1 className={styles.currentTime}>{formatTime(currentTime)}</h1>
                <div className={styles.date}>
                    {currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            <div className={styles.alarmControls}>
                <div className={styles.alarmForm}>
                    <input
                        type="time"
                        value={alarmTime}
                        onChange={handleAlarmTimeChange}
                        className={styles.timeInput}
                    />
                    <button onClick={setAlarm} className={styles.setButton}>
                        Set Alarm
                    </button>
                </div>

                {isAlarmTriggered && (
                    <button onClick={stopAlarm} className={styles.stopButton}>
                        Stop Alarm
                    </button>
                )}
            </div>

            {showToast && <div className={styles.toast}>Alarm set successfully!</div>}

            {alarms.length > 0 && (
                <div className={styles.alarmsList}>
                    <h3>Set Alarms</h3>
                    <ul>
                        {alarms.map(alarm => (
                            <li key={alarm.id} className={alarm.triggered ? styles.triggeredAlarm : ''}>
                                <span>{alarm.time}</span>
                                {alarm.triggered ? (
                                    <button onClick={() => resetAlarm(alarm.id)} className={styles.setButton}>
                                        Set
                                    </button>
                                ) : (
                                    <button onClick={() => deleteAlarm(alarm.id)} className={styles.deleteButton}>
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <audio ref={audioRef} src={audio} loop />
        </div>
    );
};

export default AlarmClock;