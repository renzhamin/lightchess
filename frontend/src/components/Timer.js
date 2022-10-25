import React from "react"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"

function Timer(props, ref) {
    const { initialMinute = 5, initialSeconds = 0 } = props
    const [minutes, setMinutes] = useState(initialMinute)
    const [seconds, setSeconds] = useState(initialSeconds)
    const [isTicking, setIsTicking] = useState(props.isTicking)

    useImperativeHandle(ref, () => ({
        getMinutes,
        getSeconds,
        stopTimer,
        startTimer,
    }))

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
