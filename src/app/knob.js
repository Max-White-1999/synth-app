import React, {useCallback, useRef} from 'react'
import {useStoredState} from './storage.js'

function computeSteppedValue(min, max, step, value) {
    if (step === 0) {
        return value
    } else {
        let difference = value - min
        let steppedDifference = Math.round(difference / step) * step
        return Math.min(max, min + steppedDifference)
    }
}

function computeValueString(min, max, value, valueDecimals, valueList) {
    if (Array.isArray(valueList)) {
        if (valueList.length > 0) {
            let index = Math.round((valueList.length - 1) * (value - min) / (max - min))
            return valueList[index]
        }
    }
    return value.toFixed(valueDecimals)
}

function clearSelections() {
    if (typeof window !== "undefined") {
        const selection = window.getSelection()
        selection.empty()
    }
}

export default function Knob({
    scale = 1,
    x = 0,
    y = 0,
    size = 128,
    strokeWidth = 32,
    baseColor = "#0000003f",
    fillColor = "#000000ff",
    min = 0,
    max = 1,
    step = 0,
    mouseResolution = 256,
    emptyValue = 0,
    defaultValue = 0,
    font = "Arial, Helvetica, sans-serif",
    fontColor = "#000000ff",
    fontWeight = 400,
    showValue = true,
    valueSize = 12,
    valueDecimals = 2,
    valueList = null,
    labelSize = 12,
    labelHeight = -50,
    labelText = "Knob",
    storageKey = "Knob"
}) {
    // Drawing
    let radius = size / 2
    let scaledSize = size * scale
    let minAngle = 2 * Math.PI * 5 / 8
    let maxAngle = 2 * Math.PI * -1 / 8
    let basePathRadius = radius - strokeWidth / 2
    let basePathOffset = Math.SQRT1_2 * basePathRadius
    let basePathStartX = radius - basePathOffset
    let basePathStartY = radius + basePathOffset
    let basePathEndX = basePathStartY
    let basePathEndY = basePathStartY
    let basePathData = "M" + basePathStartX + "," + basePathStartY
    basePathData += " A" + basePathRadius + "," + basePathRadius + " 0"
    basePathData += " 1,1 " + basePathEndX + "," + basePathEndY
    let emptyValueFraction = (emptyValue - min) / (max - min)
    let emptyValueAngle = emptyValueFraction * (maxAngle - minAngle) + minAngle
    let fillPathStartX = radius + Math.cos(emptyValueAngle) * basePathRadius
    let fillPathStartY = radius - Math.sin(emptyValueAngle) * basePathRadius
    const [value, setValue] = useStoredState(storageKey, defaultValue)
    let steppedValue = computeSteppedValue(min, max, step, value)
    let valueString = computeValueString(
        min, max, steppedValue, valueDecimals, valueList
    )
    let valueFraction = (steppedValue - min) / (max - min)
    let valueAngle = valueFraction * (maxAngle - minAngle) + minAngle
    let fillPathEndX = radius + Math.cos(valueAngle) * basePathRadius
    let fillPathEndY = radius - Math.sin(valueAngle) * basePathRadius
    let fillPathData = "M" + fillPathStartX + "," + fillPathStartY
    fillPathData += " A" + basePathRadius + "," + basePathRadius + " 0"
    let largeArcFlag =
        Math.abs(valueFraction - emptyValueFraction) > (0.5 / 0.75) ? "1" : "0"
    let sweepFlag = (valueFraction - emptyValueFraction) > 0 ? "1" : "0"
    fillPathData += " " + largeArcFlag + "," + sweepFlag
    fillPathData += " " + fillPathEndX + "," + fillPathEndY
    // Handling mouse interaction
    const handleMouseDrag = useCallback((event) => {
        event.preventDefault()
        clearSelections()
        let valueDelta = (max - min) * -event.movementY / mouseResolution
        setValue((prev) => {
            return Math.max(min, Math.min(max, prev + valueDelta))
        })
    }, [min, max, mouseResolution])
    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseDrag)
        document.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseDrag])
    const handleMouseDown = useCallback(() => {
        clearSelections()
        document.addEventListener('mousemove', handleMouseDrag)
        document.addEventListener('mouseup', handleMouseUp)
    }, [handleMouseDrag, handleMouseUp])
    // Handling touch interaction
    const touchCoords = useRef(null)
    const handleTouchDrag = useCallback((event) => {
        clearSelections()
        if (!touchCoords.current) {
            return
        }
        let valueDelta = 
            (max - min) * (touchCoords.current.y - event.touches[0].screenY) /
            mouseResolution
        touchCoords.current = {
            x: event.touches[0].screenX,
            y: event.touches[0].screenY
        }
        setValue((prev) => {
            return Math.max(min, Math.min(max, prev + valueDelta))
        })
    }, [min, max, mouseResolution])
    const handleTouchEnd = useCallback(() => {
        touchCoords.current = null
        document.removeEventListener('touchmove', handleTouchDrag)
        document.removeEventListener('touchend', handleTouchEnd)
    }, [handleTouchDrag])
    const handleTouchStart = useCallback((event) => {
        clearSelections()
        touchCoords.current = {
            x: event.touches[0].screenX,
            y: event.touches[0].screenY
        }
        document.addEventListener('touchmove', handleTouchDrag)
        document.addEventListener('touchend', handleTouchEnd)
    }, [handleTouchDrag, handleTouchEnd])
    return (
        <div
            style = {{
                touchAction: "none",
                left: x * scale,
                top: y * scale,
                width: "fit-content",
                height: "fit-content"
            }}
            onMouseDown = {handleMouseDown} onTouchStart = {handleTouchStart}
        >
            <div
                style = {{
                    visibility: showValue ? "visible" : "hidden",
                    width: scaledSize,
                    height: scaledSize,
                    color: fontColor,
                    fontFamily: font,
                    fontWeight: fontWeight,
                    fontSize: valueSize * scale,
                    textAlign: "center",
                    alignContent: "center"
                }}
            >{valueString}</div>
            <svg width = {scaledSize + "px"} height = {scaledSize + "px"}
                viewBox = {"0 0 " + scaledSize + " " + scaledSize}
                stroke = {baseColor} strokeWidth = {strokeWidth} 
                fill = "#00000000"       
            >
                <path d = {basePathData}/>
                <path d = {fillPathData} stroke = {fillColor}/>
            </svg>
        </div>
    )
}