module Jekyll
  module I18nUrlFilter

    def i18n_url(url, language = current_language)
      url = "/#{url}" unless url.start_with?('/')
      url = url.gsub(/^\/#{current_language}\//, '/')
      url = "/#{language}#{url}" unless default_language?(language)
      "#{url}"
    end

    private

    def base_url
      i18n_helper.site.config['url']
    end

    def current_language
      i18n_helper.current_language
    end

    def default_language?(language)
      language == i18n_helper.languages.first
    end

    def i18n_helper
      @i18n_helper ||= I18nHelper.new(@context)
    end
  end
end

Liquid::Template.register_filter(Jekyll::I18nUrlFilter)
