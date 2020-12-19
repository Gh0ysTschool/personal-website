<script>
    import NavBar from './NavBar.svelte'
    import Stats from './Stats.svelte'
    import Modal from './Modal.svelte'
    import ModalToggle from './ModalToggle.svelte'
    import ValueProposition from './ValueProposition.svelte'
    import Card from './Card.svelte'
</script>
 
<style>
.grid, .grid2 {
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-gap: 1em;
    width: 100%;
}
.grid > div, .grid2 > div {
    position: relative;
    width: 10em;
    height: 10em;
}
.grid > div::after, .grid2 > div::after {
    position: absolute;
    content: 'content';
}
@media (orientation: landscape) {
    .orientation {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 1em;
    }
    .grid2 {
        max-height: 80vh;
        overflow: scroll;
        grid-gap: 0;
    }
}
</style>
<NavBar>
    <div class='orientation'>
        <div class='grid'>
            <Stats></Stats>
            <ValueProposition></ValueProposition>
        </div>
        
        <div class='grid2'>
            <Card title="Eminent Domain: Game Dev with Progressive Web Apps">TMG’s Eminent Domain takes a beautifully realized 4x space exploration
                game and compresses it into a compact card game that casts aside all the
                unnecessary complexity while losing none of the feelings associated with
                a good 4x game. It can’t fit this card game in my pocket, so let's build a
                progressive web app in a framework pioneered by the NY Times devs. Built using Javascipt, Node.js, & Svelte </Card>
            <Card title ='Zelda: NES Memory Efficiency in the 1980s in the Browser'secondaryColor=true>Explore the design methodologies of the mid 1980’s that allowed
                Nintendo to fit a large scale adventure rpg with end game content into
                just 128Kbs as I port the code from assembly to run on web technologies. Built with Javascript, Node.js, & Svelte</Card>
            <Card title='Jira in Svelte: A Best Practice Demonstration'>A simplified clone of Jira, the productivity software suite. Svelte is a
                relatively recent addition to the popular web frameworks and therefore
                there aren’t as many data-intensive projects of scale in the framework
                yet. Jira in Svelte acts as a template for what such a project could look like
                in a professional environment at scale. Built with Javascript, Node.js, & Svelte</Card>
            <Card title='Cthulhu Wars Online' secondaryColor=true>Cthulhu Wars is a combination of strategic gaming and Lovecraftian horror, with the bonus of high-quality monster figures to make your game even more fun. Sandy Petersen, its creator, is well-known as one of the top game designers in the industry, and this is his best work so far! I am bringing this massive mechanically asymmetrical game to the online platform. Built with Javascript, Node.js, & Svelte</Card>
            <Card></Card>
            <Card secondaryColor=true></Card>
            <Card></Card>
            <Card secondaryColor=true></Card>
        </div>
    </div>
    <Modal></Modal>
</NavBar>