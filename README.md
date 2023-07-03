# Program do generowania plików do rozliczenia sprzedaży z Allegro

Automat z którego korzystamy do rozliczenia sprzedaży z Allegro przyjmuje na wejściu jedynie dane dotyczące jednego przelewu. Zazwyczaj nie stanowi to problemu, bo Allegro automatycznie wysyła plik zawierające odpowiednie dane. Problem pojawia się, gdy z jakiegoś powodu automatyczna wiadomość nie zostanie wygenerowana, bądź do nas nie dotrze. Należy wtedy ręcznie wygenerować raport z sprzedaży, a tego niestety nie da się zawęzić do tylko jednego przelewu. W takiej sytuacji należy poprawić plik ręcznie, np. w edytorze tekstowym. Program ten ma na celu uproszczenie tego procesu. Na wejściu przyjmuje identyfikator przelewu oraz plik csv z danymi z Allegro.

Program sprawdza poprawność formatu identyfikatora płatności (uuid) oraz poprawnośc formatu pliku csv.

![allegro-r-app](https://github.com/nazzgar/allegro-r-app/assets/44140153/c4428c3e-bf11-469e-ba33-feb9320ee8f9)

# Tech Stack

Tauri + React
