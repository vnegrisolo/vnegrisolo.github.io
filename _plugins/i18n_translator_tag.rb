module Jekyll
  class I18nTranslatorTag < Liquid::Tag

    def initialize(_name, text, _tokens)
      super
      @text = text.strip
    end

    def render(context)
      @context = context
      locale.dig(*@text.split(' '))
    end

    private

    def locale
      i18n_helper.locales[i18n_helper.current_language]
    end

    def i18n_helper
      @i18n_helper ||= I18nHelper.new(@context)
    end
  end
end

Liquid::Template.register_tag('t', Jekyll::I18nTranslatorTag)
