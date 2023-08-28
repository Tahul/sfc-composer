<template>
  <div class="motd">
    <p>
      SFC Composer provides wrapper classes around <a>MagicString</a> making the orchestration of transforms on Single File Components a breeze.
    </p>

    <p>
      In this example you can try editing each of the source SFC blocks independently.
    </p>

    <p>
      Learn more on <a href="https://github.com/Tahul/sfc-composer">GitHub</a>
    </p>
  </div>
</template>

<style lang="postcss" scoped>
.motd {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #646cff;
  border-radius: 4px;
  background-color: #1a1a1a;
}

p {
  text-align: center;
  margin: .25rem 0;
}

.end {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  opacity: 0.5;
}
</style>
