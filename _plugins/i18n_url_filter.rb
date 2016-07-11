module Jekyll
  module I18nUrlFilter

    def i18n_url(url, language)
      @url = url
      @language = language

      languages.each { |lang| url = url.gsub(/^\/#{lang}\//, '/') }
      url = "/#{language}#{url}" unless default_language?
      url
    end

    private

    def languages
      @context.registers[:site].config['languages']
    end

    def default_language?
      @language == languages.first
    end
  end
end

Liquid::Template.register_filter(Jekyll::I18nUrlFilter)
