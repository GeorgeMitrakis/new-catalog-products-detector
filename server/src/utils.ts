export function getArrayWithoutElem<T = number>(elem: T, array: T[]){
    const iterationIndex = array.indexOf(elem);

    if(iterationIndex >= 0){
        return [
            ...array.slice(0, iterationIndex), 
            ...array.slice(iterationIndex + 1)
        ];
    }
    else {
        return array;
    }

}