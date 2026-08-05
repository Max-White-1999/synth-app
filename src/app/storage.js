import {useState, useEffect} from 'react'

export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Error setting localStorage item', error)
    }
}

export function getStorageItem(key, defaultValue) {
    try {
        let item = localStorage.getItem(key)
        if (item !== null) {
            return JSON.parse(item)
        } else {
            return defaultValue
        }
    } catch (error) {
        console.error('Error getting localStorage item', error)
    }
}

export function useStoredState(key, defaultValue) {
    let [state, setState] = useState(defaultValue)
    useEffect(() => {
        setState(getStorageItem(key, defaultValue))
    }, [])
    useEffect(() => {
        setStorageItem(key, state)
    }, [key, state])
    return [state, setState]
}