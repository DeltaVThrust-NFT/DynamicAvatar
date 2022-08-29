export const computeTokenImgStyle = (img = null) => {
    const styles = {}
    if(img) styles.background = `url(${img})no-repeat center/contain`
    return styles
}