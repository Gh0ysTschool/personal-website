<script>
    import ObviousIngredient from './ObviousIngredient.svelte'
    import ObviousInstruction from './ObviousInstruction.svelte'
    //export let ingredient = {name:'flour', desc:'all-purpose', quantity:'5g'}
    export let 
        title='',
        ingredients=[],
        instruction=''
</script>
 
<style>
    div {
        background:linear-gradient(65deg, #222222, #252025);
        border-radius: 3px;
        box-sizing: border-box;
        padding: 1rem;
        width: 480px;
        height: fit-content;
        margin: 1rem;
        border-radius: 1rem;
        font-size: 28px;
        position: relative;
        flex-shrink: 0;
    }
    .ingredient-grid {
        display: grid;
        grid-template-columns: auto;
        grid-gap: 1rem;
        width: fit-content;
        height: fit-content;
    }
    .logo {
        position: absolute;
        top: 3rem;
        right: 1rem;
        width: 7rem;
        height: 7rem;
        border-radius: 2rem;
        box-shadow: -1px 3px 3px 0px black;
    }
</style>
<div>
<div class='ingredient-grid'>
    {#each ingredients as ingredient}
        <ObviousIngredient {...ingredient}></ObviousIngredient>
    {/each}
</div>
<ObviousInstruction {instruction}></ObviousInstruction>
<img class='logo' src='./ingredients/logo.png'>
</div>
