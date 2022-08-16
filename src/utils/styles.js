export const computeTokenImgStyle = (img = null) => {
    const styles = {}
    if(img) styles.background = `url(${img})no-repeat center/cover`
    return styles
}