<script>
export let name, desc, quantity
let src = `./ingredients/${name.replace(/\s/g, '')}.png`, alt = name
</script>
 
<style>
div {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto auto;
    align-content: center;
    align-items: center;
    justify-content: flex-start;
    height: 4rem;
    max-width: fit-content;
    padding: 0 1rem;
}
div > img{
    object-fit: contain;
    height: 6rem;
    width: 6rem;
    
}
div > div{
    color: white;
    opacity: 64%;
    display: grid;
    width: fit-content;
    justify-content: center;
    align-content: center;
    box-shadow:0 0 0;
}

</style>

    <!-- box-shadow: 0px 1px 3px 0px black;
    
    background: #323232; -->
<div>
    <img src={src} alt={alt}>
    <div>{name + ' ' + desc + ((quantity.length == 0) ? '' : (' (' + quantity + ')'))}</div>
</div>