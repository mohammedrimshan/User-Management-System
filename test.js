const obj = {
    "a":[1,2,3],
    "b":1,
    "c":5,
    "d":[10,20]
};

let newArr=Object.values(obj).flat()  
console.log(newArr)