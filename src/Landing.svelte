<script>
    import NavBar from './NavBar.svelte'
    import Stats from './Stats.svelte'
    import Modal from './Modal.svelte'
    import ModalToggle from './ModalToggle.svelte'
    import ValueProposition from './ValueProposition.svelte'
    import Card from './Card.svelte'
    import {onMount} from 'svelte'
    let qposts = {}
    let post = {title:'',blurb:''}
    let setPost = (t,b) => {
        post.title = t 
        post.blurb = b
    }
    onMount( ()=>{
        let qpost = new URLSearchParams(window.location.search).get('post')
        if (qposts[qpost]){
            [...document.querySelectorAll('.modal')].map(el=>{
                el.classList.remove('hiddenModal')
                el.classList.add('visibleModal')
            })
            setPost(qposts[qpost])
        }
    })

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
            <Card {setPost} title="Eminent Domain: Game Dev with Progressive Web Apps">
                TMG’s Eminent Domain takes a beautifully realized 4x space exploration
                game and compresses it into a compact card game that casts aside all the
                unnecessary complexity while losing none of the feelings associated with
                a good 4x game. It can’t fit this card game in my pocket, so let's build a
                progressive web app in a framework pioneered by the NY Times devs. Built using Javascipt, Node.js, & Svelte 
                eminent-domain-2020.herokuapp.com/</Card>
            <Card {setPost} title ='Zelda: NES Memory Efficiency in the 1980s in the Browser'secondaryColor=true>Explore the design methodologies of the mid 1980’s that allowed
                Nintendo to fit a large scale adventure rpg with end game content into
                just 128Kbs as I port the code from assembly to run on web technologies. Built with Javascript, Node.js, & Svelte
                https://github.com/Gh0ysTschool/Z1RE</Card>
            <Card {setPost} title='Jira in Svelte: A Best Practice Demonstration'>A simplified clone of Jira, the productivity software suite. Svelte is a
                relatively recent addition to the popular web frameworks and therefore
                there aren’t as many data-intensive projects of scale in the framework
                yet. Jira in Svelte acts as a template for what such a project could look like
                in a professional environment at scale. Built with Javascript, Node.js, & Svelte
                https://github.com/Gh0ysTschool/svelte-jira</Card>
            <Card {setPost} title='Cthulhu Wars Online' secondaryColor=true>Cthulhu Wars is a combination of strategic gaming and Lovecraftian horror, with the bonus of high-quality monster figures to make your game even more fun. Sandy Petersen, its creator, is well-known as one of the top game designers in the industry, and this is his best work so far! I am bringing this massive mechanically asymmetrical game to the online platform. Built with Javascript, Node.js, & Svelte bradleypudsey.now.sh and glacial-garden-41261.herokuapp.com/ </Card>
            <Card {setPost} title='Sci-Fi Weapons Dealer UI Menu'>bradleypudsey.now.sh/weapon-dealer-menu</Card>
            <Card {setPost} title="90's Hacking in the Browser UI w/ uiterminal.css" secondaryColor=true>Developed in a dingy smoke-filled cyberpunk bordello while Cowboy Bebop wafts gently through the airwaves omerimzali finished their demake for the browser ui on March 31st 2019 after only 24 days of devlopment. Your text will never look more retro, with support for
                Terminal Lines
                Iconic Colors
                Forms
                Buttons
                Badges
                Progress Bars
                headings
                Lists
                Tables
                Images
                bring back the holodecks and text-only interfaces for a feeling oh so a e t h e t i c . for Guidance you'll find a plethora of examples right here and I'll see you next time on CSS Gems</Card>
            <Card {setPost} title='Final Fantasy 7 Browser UI w/ PSone.css' >
                PSone.css
                
                Taking inspiration from NES.css's developer B.C.Rikko, micah5 set out to bring pixelart UI in the browser from the 8-bit era of NES to the 16-bit era of the Playstation One. Stylized using classics like Tekken 3, Metal Gear Solid, Final Fantasy 7, and the PSOne's core UI, PSone.css exploded fresh onto the scene in November of 2018 and could use some recognition for Currently topping out at 312 stars on Github, PSone.css Offers a concise feature-set, including component styling for:
                
                Text Areas & Fields
                Push & Radio Buttons
                Checkboxes
                Inputs
                Containers
                Dialogs
                Lists
                Progress Bars
                Cursors
                Playstation One Era Controller Icons
                While is currently lacks fully realized dark themes across the board for each styling like its predecessor NES.css, we wish its developer the best with the remaining endeavors as continues development. A live demo can be found here and I'll see you next time on CSS Gems
                </Card>
            <Card {setPost} title='Portal in Isometric Pixelart' secondaryColor=true>bradleypudsey.now.sh/portal/</Card>
            <Card {setPost} title='Pico-8-style Isometric Tactics RPG Web demo'></Card>
            <Card {setPost} title='Bringing pixelart UI into the Browser w/ NES.css' secondaryColor=true>NES.css
                Developed out of a not-so-uncommon distaste for standard css tropes, NES.css's developer B.C.Rikko finished paving their path to mainstream recognition with the release of v1.0.0. After recieving a github star from kazuya kawaguchi on the 15ths of November 2018, the repository skyrocketed to 1000 stars in exactly 14 days, earning B.C.Rikko their first GitHub Trending Developer award. By January of 2019 NES.css had won over 10,000 stars & reached 5th place on the GitHub css-framework topic. Offering a robust feature-set, NES.css came complete with NES pixel art stylings for:
                Text Areas & Fields
                Push & Radio Buttons
                Checkboxes
                Inputs
                Dropdowns
                Containers
                Dialogs
                Lists
                Tables
                Progress Bars
                Avatars
                Speech Bubbles w/ Sprite Faces
                Cursors
                Badges
                Reactions
                Social & Commercial Icons
                The whole package came with a smattering of Nintendo-brand pixel prites & fully realized dark themes across the board for each styling. A live demo can be found here and I'll see you next time on CSS Gems
            </Card>
            <Card {setPost} title='Sekiro Upgrade Path Planner'>
                sekiro-prosthetic-upgrade-tracker.now.sh
            </Card>
            <Card {setPost} title='Japanese Flash Cards' secondaryColor=true> japanese-flashcards.now.sh </Card>
            <Card {setPost}></Card>
            <Card {setPost} secondaryColor=true></Card>
        </div>
    </div>
    <Modal {post} ></Modal>
</NavBar>