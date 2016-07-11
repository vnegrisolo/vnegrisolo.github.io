module Jekyll
  class I18nTranslatorTag < Liquid::Tag

    def initialize(_name, text, _tokens)
      super
      @text = text.strip
    end

    def render(context)
      @context = context
      locale[@text]
    end

    private

    def locale
      @locale ||= locales[locale_string] || locales[default_language]
    end

    def locales
      @locales ||= @context.registers[:site].data['i18n']
    end

    def locale_string
      page['url'][0..3].gsub('/', '')
    end

    def default_language
      @context.registers[:site].config['languages'].first
    end

    def page
      @context.registers[:page]
    end
  end
end

Liquid::Template.register_tag('t', Jekyll::I18nTranslatorTag)
