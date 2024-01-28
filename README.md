# Next.jsのAppRouterでSupabaseの認証機能を実装する方法

## 環境構築

### リポジトリの作成

ハリボテTODOアプリをテンプレートとしてリポジトリを作成します。

https://github.com/shinaps/nextjs-haribote-todo-app

<img width="1680" alt="%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-27_17 22 51" src="https://github.com/shinaps/nextjs-approuter-supabase-todoapp/assets/113443658/1f0f0f5c-74f6-4977-88f8-2c92ab43ad42">


できました。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp

### 作成したリポジトリをクローン

```bash
git clone git@github.com:shinaps/nextjs-approuter-supabase-todoapp.git
Cloning into 'nextjs-approuter-supabase-todoapp'...
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
remote: Enumerating objects: 44, done.
remote: Counting objects: 100% (44/44), done.
remote: Compressing objects: 100% (39/39), done.
remote: Total 44 (delta 0), reused 42 (delta 0), pack-reused 0
Receiving objects: 100% (44/44), 71.36 KiB | 445.00 KiB/s, done.
```

### ハリボテTODOアプリ起動

```bash
npm install
npm run dev
```

<img width="1435" alt="%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-27_17 32 34" src="https://github.com/shinaps/nextjs-approuter-supabase-todoapp/assets/113443658/17465394-a082-4c1b-be96-22fdc52883ce">

### Supabaseでプロジェクトを作成

https://supabase.com/dashboard/new

<img width="1680" alt="%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-27_18 20 03" src="https://github.com/shinaps/nextjs-approuter-supabase-todoapp/assets/113443658/7399fba5-1dc7-43b1-9e80-c8934018083b">

## 実装

以下のページを参考に実装していきます。

https://supabase.com/docs/guides/auth/server-side/nextjs

### パッケージのインストール

```bash
npm install @supabase/ssr
```

### 環境変数の設定

`https://supabase.com/dashboard/project/{Reference ID}/settings/api` のURLにアクセスしてProject URLとProject API keysの`anon key` を.env.localに転記します。

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

以下の手順は今回はスキップ可能です。スキップする場合は`createBrowserClient<Database>`

を`createBrowserClient`のように書き換えて使用してください。

<details>
  
<summary>Supabaseの型情報をクライアントで使用できるようにする（オプショナル）</summary>

### Supabaseの型情報を生成
    
https://supabase.com/docs/reference/cli/supabase-gen-types-typescript

https://supabase.com/docs/reference/javascript/typescript-support#generating-typescript-types

```bash
npm install supabase
npx supabase login
supabase init
supabase link --project-ref {Reference ID}
supabase gen types typescript --linked > supabase/database.types.ts
```

これで`supabase/database.types.ts` に型の情報が生成されます。

`supabase link --project-ref {Reference ID}` の時にDBのパスワードが求められるので、忘れてしまった場合は以下のボタンをクリックすればリセットできます。

`https://supabase.com/dashboard/project/{Reference ID}/settings/database`のURLからページにアクセスできます。

<img width="1124" alt="%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2024-01-28_0 35 37" src="https://github.com/shinaps/nextjs-approuter-supabase-todoapp/assets/113443658/ab19f6e0-f9ba-4d53-8379-5b2958265c0f">

### clientに型情報を追加

以下のようにジェネリック型にDatabaseという型を渡すことで、データベースの型を参照できるようになります。

```tsx
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../../supabase/database.types";

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};
```

</details>


### クライアントの作成

今回は１種類（Server ActionsとRoute Handlersで使用するクライアント）しか作成する必要はありませんが、実際にアプリケーションで使用する場合は、３種類作成することになると思います。その３種類というのは以下の３つです。

- Client Componentsで使用するクライアント
- Server Componentsで使用するクライアント
- Server ActionsとRoute Handlersで使用するクライアント

サーバーサイドで使用するクライアントが２種類あるのは以下のように、Server ComponentsではCookieの書き込みができないという特徴があるからです。

|  |  Cookieの読み取り | Cookieの書き込み |
| --- | --- | --- |
| Server Components | できる | できない |
| Route Handlers | できる | できる |
| Server Actions | できる | できる |

Server ActionsとRoute Handlersで使用するクライアントには`cookie-writable-server-client.ts` という名前をつけましたが、他にいい名前があればそれを使用してください。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp/blob/47167a91112c76dd4038208faff9bc6284c602c3/src/clients/supabase/cookie-writable-server-client.ts#L1-L23

### ミドルウェアの作成

ミドルウェアでは Cookieの情報を使用してuserの情報を取得し、userが取得できない場合はサインインのページにリダイレクトする処理になっています。

プロバイダーの設定（後で行います）で`Confirm email`が`ON`になっている場合、メールアドレスの確認が完了していないユーザーはサインアップできていてもNULLになるので気をつけてください。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp/blob/47167a91112c76dd4038208faff9bc6284c602c3/src/middleware.ts#L1-L74

### プロバイダーの設定

今回はメールアドレスの検証の実装は行わないので、

`https://supabase.com/dashboard/project/{Reference ID}/auth/providers` のURLにアクセスし、`Auth Providers` > `Email` > `Confirm email`をOFFにします。

### サインイン用のactionを作成

自分はわかりやすいので`src/app/services/auth/sign-in.action.ts` という名前にして関数名にも`Action`をつけてますが、`action`を付けないといけないという決まりはありません。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp/blob/47167a91112c76dd4038208faff9bc6284c602c3/src/app/services/auth/sign-in.action.ts#L1-L24

### サインアップ用のactionを作成

サインイン用のactionとほぼ同じです。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp/blob/47167a91112c76dd4038208faff9bc6284c602c3/src/app/services/auth/sign-up.action.ts#L1-L23

### サインイン用のページを作成

プログレッシブエンハンスメントは捨てました。`use client`を使います。

https://github.com/shinaps/nextjs-approuter-supabase-todoapp/blob/47167a91112c76dd4038208faff9bc6284c602c3/src/app/sign-in/page.tsx#L1-L81

ここは以下のページを見ていただければわかると思うので、説明は省きます。

わからなかったらコメントかDMしてください。

[Data Fetching: Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#forms)
