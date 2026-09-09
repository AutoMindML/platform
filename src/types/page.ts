export type PageProps = {
  params: Promise<{
    lng: string;
  }>;
};

export type PageWithIdProps = PageProps & { params: Promise<{ id: string }> };
