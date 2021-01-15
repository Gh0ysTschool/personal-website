<script>
</script>

<style>
ul {
    background: var(--clr1);
    list-style: none;
}
ul > li {
    height: 1.2em;
    position: relative;
    background: var(--clr0);
    margin: 2em;
    text-align: center;
}
ul > li::before {
  position: absolute;
  content: "";
  background: var(--clr4);
  display: inline-block; 
  width: 1em;
  height: 1em;
  left: -1.8em;
}
li:nth-child(2n)::before{
    background: var(--clr5)
}
li:nth-child(3n)::before{
    background: var(--clr6)
}
li:nth-child(4n)::before{
    background: var(--clr7)
}
li:nth-child(5n)::before{
    background: var(--clr8)
}
li:nth-child(6n)::before{
    background: var(--clr9)
}
li > span {
    background: -webkit-linear-gradient(0deg, var(--clr2), var(--clr3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>

<!-- ul :nth-child(2n) > span {
    background: -webkit-linear-gradient(0deg, var(--clr3), var(--clr2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
} -->
<ul>
    <li><span><a href='./contact/'>contact</a></span></li>
    <li><span>support</span></li>
    <li><span>courses</span></li>
    <li><span>podcast</span></li>
    <li><span>artwork</span></li>
    <li><span>webapps</span></li>
    <li><span>gaming</span></li>
    <li><span>writing</span></li>
</ul>