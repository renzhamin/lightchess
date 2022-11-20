import React from "react"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"

function Timer(props, ref) {
    const { initialMinute, initialSeconds } = props
    const [minutes, setMinutes] = useState(initialMinute)
    const [seconds, setSeconds] = useState(initialSeconds)
    const [isTicking, setIsTicking] = useState(props.isTicking)

    useImperativeHandle(ref, () => ({
        getMinutes,
        getSeconds,
        stopTimer,
        startTimer,
        startMinutes,
        incrementTimer,
        setAll,
    }))

    function setAll(min, sec) {
        setMinutes(min)
        setSeconds(sec)
    }

    function getMinutes() {
        return minutes
    }

    function getSeconds() {
        return seconds
    }

    function stopTimer() {
        setIsTicking(0)
    }

    function startTimer() {
        setIsTicking(1)
    }

    function startMinutes(m) {
        setMinutes(m)
        setSeconds(0)
    }

    function incrementTimer(increment) {
        if (seconds + increment >= 60) {
            setSeconds(increment - (60 - seconds))
            setMinutes(minutes + 1)
        } else {
            setSeconds(seconds + increment)
        }
    }

    useEffect(() => {
        let myInterval = 500
        if (isTicking) {
            myInterval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1)
                }
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(myInterval)
                    } else {
                        setMinutes(minutes - 1)
                        setSeconds(59)
                    }
                }
            }, 500)
        }

        return () => {
            clearInterval(myInterval)
        }
    })

    return <></>
}

export default forwardRef(Timer)
