module Jekyll
  class CategoryPageGenerator < Generator
    safe true

    def generate(site)
      @site = site

      categories.each do |category|
        site.pages << CategoryPage.new(site, category)
      end
    end

    def categories
      @site.categories.keys.reject do |category|
        languages.include?(category)
      end
    end

    private

    def languages
      @site.config['languages']
    end
  end

  class CategoryPage < Page
    def initialize(site, category)
      @site = site
      @base = site.source
      @dir = "/#{category}"
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(@base, '_layouts'), 'category.html')
      self.data['category'] = category
    end
  end
end
