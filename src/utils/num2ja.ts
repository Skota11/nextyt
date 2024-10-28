export default function toJaNum(num: any) {
    if (typeof num === "number") {
        num = num.toString();
    }

    let prefix = "";

    if (num[0] === "-") {
        num = num.slice(1);
        prefix = "-";
    }

    return (
        prefix +
        num
            .slice(0, -12)
            .replace(/^0+/, "")
            .replace(/([0-9]+)/g, "$1兆") +
        num
            .slice(-12, -8)
            .replace(/^0+/, "")
            .replace(/([0-9]+)/g, "$1億") +
        num
            .slice(-8, -4)
            .replace(/^0+/, "")
            .replace(/([0-9]+)/g, "$1万") +
        num.substring(num.length - 4).replace(/^0+/, "")
    );
};