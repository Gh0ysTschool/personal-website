<script>
    import ObviousCard from './ObviousCard.svelte'
    export let recipe = {
        ingredients : [
        /*00*/{name:'baking powder',desc:'',quantity:'1/2tsp'},
        /*01*/{name:'baking soda',desc:'',quantity:'1/2tsp'},
        /*02*/{name:'butter',desc:'',quantity:'100g'},
        /*03*/{name:'caramel',desc:'',quantity:''},
        /*04*/{name:'cocoa powder',desc:'',quantity:'50g'},
        /*05*/{name:'coffee',desc:'',quantity:'70g'},
        /*06*/{name:'egg',desc:'',quantity:''},
        /*07*/{name:'flour',desc:'',quantity:'85g'},
        /*08*/{name:'heavy cream',desc:'',quantity:'125g'},
        /*09*/{name:'marzcapone',desc:'',quantity:'150g'},
        /*10*/{name:'milk',desc:'',quantity:'70g'},
        /*11*/{name:'salt',desc:'',quantity:'pinch'},
        /*12*/{name:'sugar',desc:'',quantity:'120g'},
        /*13*/{name:'vinegar',desc:'',quantity:'1/2tsp'},
        /*14*/{name:'batter',desc:'',quantity:''},
        /*15*/{name:'dry',desc:'',quantity:''},
        /*16*/{name:'wet',desc:'',quantity:''},
        /*17*/{name:'oven',desc:'',quantity:''},
        /*18*/{name:'cupcake tin',desc:'',quantity:''},
        /*19*/{name:'saucepan',desc:'',quantity:''},
        /*20*/{name:'pipette',desc:'',quantity:''},
        /*21*/{name:'cupcake',desc:'',quantity:''},
        /*22*/{name:'frosting',desc:'',quantity:''},
        
        /*02*/{name:'butter',desc:'',quantity:'85g'},
        /*08*/{name:'heavy cream',desc:'',quantity:'120g'},
        /*12*/{name:'sugar',desc:'',quantity:'215g'},
        /*12*/{name:'caramel',desc:'',quantity:'100g'},
        ]
    }
    let ing = recipe.ingredients;
    let steps = [
        {title:'', ingredients:[ing[2],ing[12],ing[6]], instruction:'batter:\nbeat butter & sugar until fluffy\nbeat in egg'},
        {title:'', ingredients:[ing[11],ing[7],ing[4],ing[0]], instruction:'dry ingredients:\nsift flour, cocoa, salt, baking powder'},
        {title:'', ingredients:[ing[10],ing[5]], instruction:'wet ingredients: mix milk & fresh coffee'},
        {title:'', ingredients:[ing[14],ing[15],ing[16]], instruction:'fold into the batter:\nhalf the wet\nhalf the dry\nhalf of the wet\nhalf of the dry'},
        {title:'', ingredients:[ing[14],ing[1],ing[13]], instruction:'mix vinegar & baking soda.\nfold swiftly into the batter '},
        {title:'', ingredients:[ing[17],ing[21]], instruction:'Heat oven to 175 C / 347°F\nbake 25min'},
        {title:'', ingredients:[ing[19],ing[25],ing[23],ing[8]], instruction:'caramalize sugar\ndo not stir\nmelt in butter\nbegin to whisk\nslowly add heavy cream'},
        {title:'', ingredients:[ing[3],ing[21]], instruction:'hollow out cupcake\nfill with caramel'},
        {title:'', ingredients:[ing[24],ing[26]], instruction:'beat marzcapone & heavy cream until fluffy\nlightly beat in caramel'},
        {title:'', ingredients:[ing[21],ing[20]], instruction:'pipe frosting onto cupcakes\nenjoy ^_^'},
    ]
</script>
<style>
    div {
        display: flex;
    }
</style>
<div>
    {#each steps as step}
        <ObviousCard {...step}></ObviousCard>
    {/each}
</div>