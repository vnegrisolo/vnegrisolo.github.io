# Elixir `with`

Since Elixir 1.2, Oct 2016

> Special form to match on multiple expressions

---
# Phoenix Controller

```elixir
defmodule MyAppWeb.Blog.PostController do
  # ...
  def create(conn, %{"blog_post" => blog_post}) do
    %{assigns: %{current_user: user}} = conn
    attrs = Map.put(blog_post, "user_id", user.id)
    changeset = Post.insert_changeset(%Post{}, attrs)

    case Repo.insert(changeset) do
      {:ok, blog_post} ->
        conn
        |> put_flash(:info, "Saved successfully")
        |> redirect(to: Routes.blog_post_path(conn, :show, blog_post))

      {:error, %Changeset{} = changeset} ->
        render(conn, "form.html", changeset: changeset, message: "Failed to save Blog Post")
    end
  end
end
```

---
# Phoenix Controller - Multiple clauses

```elixir
defmodule MyAppWeb.Blog.PostController do
  # ...
  def create(conn, %{"blog_post" => blog_post}) do
    %{assigns: %{current_user: user}} = conn
    attrs = Map.put(blog_post, "user_id", user.id)
    changeset = Post.insert_changeset(%Post{}, attrs)

    case Repo.insert(changeset) do
      {:ok, blog_post} ->
        user_changeset = User.update_changeset(user, %{blogs_count: user.blogs_count + 1})

        case Repo.insert(user_changeset) do
          {:ok, _user} ->
            conn
            |> put_flash(:info, "Saved successfully")
            |> redirect(to: Routes.blog_post_path(conn, :show, blog_post))

          {:error, %Changeset{} = changeset} ->
            render(conn, "form.html", changeset: changeset, message: "Failed to save User")
        end

      {:error, %Changeset{} = changeset} ->
        render(conn, "form.html", changeset: changeset, message: "Failed to save Blog Post")
    end
  end
end
```

---
# Phoenix Controller - `with`

```elixir
defmodule MyAppWeb.Blog.PostController do
  # ...
  def create(conn, %{"blog_post" => blog_post}) do
    %{assigns: %{current_user: user}} = conn
    attrs = Map.put(blog_post, "user_id", user.id)
    changeset = Post.insert_changeset(%Post{}, attrs)

    with {:ok, blog_post} <- Repo.insert(changeset),
         blogs_count = user.blogs_count + 1,
         user_changeset = User.update_changeset(user, %{blogs_count: blogs_count}),
         {:ok, _user} <- Repo.insert(user_changeset) do
      conn
      |> put_flash(:info, "Saved successfully")
      |> redirect(to: Routes.blog_post_path(conn, :show, blog_post))
    else
      {:error, %Changeset{data: %Blog.Post{}} = changeset} ->
        render(conn, "form.html", changeset: changeset, message: "Failed to save Blog Post")

      {:error, %Changeset{data: %User{}} = changeset} ->
        render(conn, "form.html", changeset: changeset, message: "Failed to save User")
        #
        # {:error, :invalid_email_address, message} ->
        #   render(conn, "change_email.html", changeset: changeset, message: message)
    end
  end
end
```
