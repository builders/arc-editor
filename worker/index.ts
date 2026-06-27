// arc-editor Worker — serves the static Tina admin UI.
// No custom routes needed: everything is handled by the assets binding.

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
