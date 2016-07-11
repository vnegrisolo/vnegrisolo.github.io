module Jekyll
  class I18nGenerator < Generator
    safe true

    def generate(site)
      @site = site
      add_pages(new_i18n_pages)
    end

    private

    def new_i18n_pages
      pages.map do |page|
        languages.map do |language|
          new_page = page.clone
          new_page.dir = "/#{language}#{page.dir}"
          new_page
        end
      end.flatten
    end

    def add_pages(pages)
      pages.each { |page| @site.pages << page }
    end

    def pages
      @pages ||= @site.pages.select { |page| page.name.end_with?('.html') }
    end

    def languages
      @languages ||= @site.config['languages'][1..-1]
    end
  end
end
