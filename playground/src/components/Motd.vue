<template>
  <div class="message">
    <p>
      SFC Composer provides wrapper classes around <a href="https://github.com/rich-harris/magic-string" target="_blank">MagicString</a> making the orchestration of transforms on Single File Components a breeze.
    </p>

    <p>
      It currently supports <a href="https://vuejs.org" target="_blank">`.vue`</a>, <a href="https://svelte.dev" target="_blank">`.svelte`</a> and <a href="https://astro.build" target="_blank">`.astro`</a> (<a href="#astro-spec">*</a>) files.
    </p>

    <p>
      In this example you can try editing each of the source SFC blocks independently.
    </p>

    <p>
      <span>
        Learn more on <a target="_blank" href="https://github.com/Tahul/sfc-composer">GitHub</a>
      </span>
      <span>
        •
      </span>
      <span>
        <a target="_blank" href="https://github.com/sponsors/Tahul">Support this project</a>
      </span>
    </p>
  </div>
</template>

<style lang="postcss">
.message {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
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
  padding: 1;
  opacity: 0.5;
}
</style>
