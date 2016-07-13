class I18nHelper
  def initialize(context)
    @context = context
  end

  def current_language
    language = page['url'][0..3].gsub('/', '')
    language = default_language unless locales[language]
    language
  end

  def default_language
    languages.first
  end

  def locales
    site.data['i18n']
  end

  def languages
    site.config['languages']
  end

  def page
    @context.registers[:page]
  end

  def site
    @context.registers[:site]
  end
end
