# GitHub README carousel behavior test

## Plain div visibility and click handler

<div id="top-test">TOP</div>

<button onclick="document.getElementById('top-test').hidden=true;document.getElementById('bottom-test').hidden=false">Next two</button>

<div id="bottom-test" hidden>BOTTOM</div>

<style>#bottom-test{display:none} #top-test:target{display:none}</style>

## Native details group with 100 loaded items

<details name="project-pairs" open><summary>Page 1 of 50</summary><div>Project 1 | Project 2</div></details>

<details name="project-pairs"><summary>Page 2 of 50</summary><div>Project 3 | Project 4</div></details>

<details name="project-pairs"><summary>Page 3 of 50</summary><div>Project 5 | Project 6</div></details>

<details name="project-pairs"><summary>Page 4 of 50</summary><div>Project 7 | Project 8</div></details>

<details name="project-pairs"><summary>Page 5 of 50</summary><div>Project 9 | Project 10</div></details>

<details name="project-pairs"><summary>Page 6 of 50</summary><div>Project 11 | Project 12</div></details>

<details name="project-pairs"><summary>Page 7 of 50</summary><div>Project 13 | Project 14</div></details>

<details name="project-pairs"><summary>Page 8 of 50</summary><div>Project 15 | Project 16</div></details>

<details name="project-pairs"><summary>Page 9 of 50</summary><div>Project 17 | Project 18</div></details>

<details name="project-pairs"><summary>Page 10 of 50</summary><div>Project 19 | Project 20</div></details>

<details name="project-pairs"><summary>Page 11 of 50</summary><div>Project 21 | Project 22</div></details>

<details name="project-pairs"><summary>Page 12 of 50</summary><div>Project 23 | Project 24</div></details>

<details name="project-pairs"><summary>Page 13 of 50</summary><div>Project 25 | Project 26</div></details>

<details name="project-pairs"><summary>Page 14 of 50</summary><div>Project 27 | Project 28</div></details>

<details name="project-pairs"><summary>Page 15 of 50</summary><div>Project 29 | Project 30</div></details>

<details name="project-pairs"><summary>Page 16 of 50</summary><div>Project 31 | Project 32</div></details>

<details name="project-pairs"><summary>Page 17 of 50</summary><div>Project 33 | Project 34</div></details>

<details name="project-pairs"><summary>Page 18 of 50</summary><div>Project 35 | Project 36</div></details>

<details name="project-pairs"><summary>Page 19 of 50</summary><div>Project 37 | Project 38</div></details>

<details name="project-pairs"><summary>Page 20 of 50</summary><div>Project 39 | Project 40</div></details>

<details name="project-pairs"><summary>Page 21 of 50</summary><div>Project 41 | Project 42</div></details>

<details name="project-pairs"><summary>Page 22 of 50</summary><div>Project 43 | Project 44</div></details>

<details name="project-pairs"><summary>Page 23 of 50</summary><div>Project 45 | Project 46</div></details>

<details name="project-pairs"><summary>Page 24 of 50</summary><div>Project 47 | Project 48</div></details>

<details name="project-pairs"><summary>Page 25 of 50</summary><div>Project 49 | Project 50</div></details>

<details name="project-pairs"><summary>Page 26 of 50</summary><div>Project 51 | Project 52</div></details>

<details name="project-pairs"><summary>Page 27 of 50</summary><div>Project 53 | Project 54</div></details>

<details name="project-pairs"><summary>Page 28 of 50</summary><div>Project 55 | Project 56</div></details>

<details name="project-pairs"><summary>Page 29 of 50</summary><div>Project 57 | Project 58</div></details>

<details name="project-pairs"><summary>Page 30 of 50</summary><div>Project 59 | Project 60</div></details>

<details name="project-pairs"><summary>Page 31 of 50</summary><div>Project 61 | Project 62</div></details>

<details name="project-pairs"><summary>Page 32 of 50</summary><div>Project 63 | Project 64</div></details>

<details name="project-pairs"><summary>Page 33 of 50</summary><div>Project 65 | Project 66</div></details>

<details name="project-pairs"><summary>Page 34 of 50</summary><div>Project 67 | Project 68</div></details>

<details name="project-pairs"><summary>Page 35 of 50</summary><div>Project 69 | Project 70</div></details>

<details name="project-pairs"><summary>Page 36 of 50</summary><div>Project 71 | Project 72</div></details>

<details name="project-pairs"><summary>Page 37 of 50</summary><div>Project 73 | Project 74</div></details>

<details name="project-pairs"><summary>Page 38 of 50</summary><div>Project 75 | Project 76</div></details>

<details name="project-pairs"><summary>Page 39 of 50</summary><div>Project 77 | Project 78</div></details>

<details name="project-pairs"><summary>Page 40 of 50</summary><div>Project 79 | Project 80</div></details>

<details name="project-pairs"><summary>Page 41 of 50</summary><div>Project 81 | Project 82</div></details>

<details name="project-pairs"><summary>Page 42 of 50</summary><div>Project 83 | Project 84</div></details>

<details name="project-pairs"><summary>Page 43 of 50</summary><div>Project 85 | Project 86</div></details>

<details name="project-pairs"><summary>Page 44 of 50</summary><div>Project 87 | Project 88</div></details>

<details name="project-pairs"><summary>Page 45 of 50</summary><div>Project 89 | Project 90</div></details>

<details name="project-pairs"><summary>Page 46 of 50</summary><div>Project 91 | Project 92</div></details>

<details name="project-pairs"><summary>Page 47 of 50</summary><div>Project 93 | Project 94</div></details>

<details name="project-pairs"><summary>Page 48 of 50</summary><div>Project 95 | Project 96</div></details>

<details name="project-pairs"><summary>Page 49 of 50</summary><div>Project 97 | Project 98</div></details>

<details name="project-pairs"><summary>Page 50 of 50</summary><div>Project 99 | Project 100</div></details>
